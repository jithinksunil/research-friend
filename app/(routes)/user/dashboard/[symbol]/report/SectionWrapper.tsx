'use client';

import React, { ReactNode, useState } from 'react';
import { Popover } from '@headlessui/react';
import { Tooltip } from '@mui/material';
import { AutoAwesome } from '@mui/icons-material';
import { SectionSeparator } from './SectionSeparator';
import { Heading } from './Heading';
import { toastMessage } from '@/lib';

export type SectionFieldName =
  | 'executiveSummary'
  | 'overviewAndStockMetrics'
  | 'shareHolderStructure'
  | 'analystRecommendation'
  | 'equityValuationAndDcfAnalysis'
  | 'financialStatementAnalyasis'
  | 'businessSegmentData'
  | 'interimResultsAndQuarterlyPerformance'
  | 'contingentLiabilitiesAndRegulatoryRisk';

interface SectionWrapperProps {
  heading: string;
  children: ReactNode;
  symbol?: string;
  onEnhanceSection?: (symbol: string, improvementNeeded: string) => Promise<void>;
}

export const SectionWrapper: React.FC<SectionWrapperProps> = ({
  heading,
  symbol,
  children,
  onEnhanceSection,
}) => {
  const [isEnhancing, setIsEnhancing] = useState(false);
  const [improvementText, setImprovementText] = useState('');
  const [citations] = useState<
    Array<{ title?: string; url: string; claim?: string }>
  >([]);
  const [showSources, setShowSources] = useState(false);
  const hasInput = improvementText.trim().length > 0;
  const canEnhance = Boolean(symbol && onEnhanceSection);

  const onEnhanceClick = async (close: () => void) => {
    setIsEnhancing(true);
    try {
      if (!symbol || !onEnhanceSection) return;
      await onEnhanceSection(symbol, improvementText);
      toastMessage.success('Section enhancement saved');
      setImprovementText('');
      close();
    } catch (err) {
      console.error('enhanceSection failed', err);
      toastMessage.error('Enhancement request failed');
    } finally {
      setIsEnhancing(false);
    }
  };

  return (
    <div>
      <div className='flex items-center justify-between mb-4'>
        <div>
          <Heading>{heading}</Heading>
        </div>
        {canEnhance && (
          <Popover className='relative'>
            <Tooltip title='Improve with AI'>
              <Popover.Button className='outline-none bg-[#F2F2F2] hover:cursor-pointer rounded-md px-1 active:scale-90 flex items-center justify-center h-[26px] aspect-square'>
                <AutoAwesome className='hover:text-primary !text-[16px] text-[#5AB46A]' />
              </Popover.Button>
            </Tooltip>
            <Popover.Panel className='absolute z-[10000] bg-white shadow-md rounded-xl right-0 top-10 min-w-[365px] md:min-w-[450px] border px-4 py-4 gap-3'>
              {({ close }) => (
                <div className='flex flex-col gap-3'>
                  <p className='text-sm font-medium text-gray-700'>
                    What do you want to improve here?
                  </p>
                  <textarea
                    value={improvementText}
                    onChange={(e) => setImprovementText(e.target.value)}
                    placeholder="Describe what improvements you'd like to make..."
                    className='w-full min-h-[100px] p-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary resize-none'
                  />
                  <div className='flex gap-2 justify-end'>
                    <button
                      onClick={() => close()}
                      className='px-4 py-2 text-sm font-medium text-gray-700 border border-gray-300 rounded-md hover:bg-gray-50'
                    >
                      Cancel
                    </button>
                    <button
                      onClick={() => onEnhanceClick(close)}
                      disabled={isEnhancing || !hasInput}
                      className='px-4 py-2 text-sm font-medium text-white bg-primary rounded-md hover:bg-primary/90 disabled:opacity-50 disabled:cursor-not-allowed'
                    >
                      {isEnhancing ? 'Enhancing...' : 'Enhance'}
                    </button>
                  </div>
                  {citations.length > 0 && (
                    <div className='mt-1 border border-gray-200 rounded-md p-2'>
                      <button
                        type='button'
                        onClick={() => setShowSources((prev) => !prev)}
                        className='text-xs font-medium text-gray-700 underline'
                      >
                        {showSources
                          ? 'Hide sources used'
                          : 'Show sources used'}
                      </button>
                      {showSources && (
                        <ul className='mt-2 flex flex-col gap-1'>
                          {citations.map((citation) => (
                            <li
                              key={citation.url}
                              className='text-xs text-gray-600'
                            >
                              <a
                                href={citation.url}
                                target='_blank'
                                rel='noreferrer'
                                className='text-primary underline break-all'
                              >
                                {citation.title || citation.url}
                              </a>
                            </li>
                          ))}
                        </ul>
                      )}
                    </div>
                  )}
                </div>
              )}
            </Popover.Panel>
          </Popover>
        )}
      </div>
      <div>{children}</div>
      <SectionSeparator />
    </div>
  );
};
