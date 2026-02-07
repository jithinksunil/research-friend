'use client';
import { getVotes, registerVote } from '@/app/actions/user';
import { toastMessage } from '@/lib';
import {
  KeyboardDoubleArrowDown,
  KeyboardDoubleArrowUp,
} from '@mui/icons-material';
import { useEffect, useState } from 'react';

export const VoteButton = ({ symbol }: { symbol: string }) => {
  const [votes, setVotes] = useState({ upVotes: 0, downVotes: 0 });
  const fetchVotes = async () => {
    try {
      const res = await getVotes(symbol);
      if (!res.okay) return;
      setVotes(res.data);
    } catch (error) {
      toastMessage.error('Error while fetching votes');
    }
  };
  const handleVote = async (vote: boolean, symbol: string) => {
    try {
      const res = await registerVote({ symbol, vote });
      //@ts-ignore
      if (!res.okay) throw new Error(res.error);
      fetchVotes();
      toastMessage.success(vote ? 'Up voted' : 'Down voted');
    } catch (error) {
      //@ts-ignore
      toastMessage.error('Error while voting');
    }
  };
  useEffect(() => {
    fetchVotes();
  }, []);
  return (
    <div className='flex gap-4 items-center justify-between'>
      <p>
        <span className='font-bold text-primary'>Wooping 50</span> Investors
        downloaded the detailed report
      </p>
      <div className='flex items-center gap-4'>
        <div className='font-bold text-muted-foreground text-sm hover:cursor-pointer hover:text-primary'>
          Comments
        </div>{' '}
        <div className='flex items-center rounded-full text-sm overflow-hidden'>
          <div
            className='flex items-center border-r border-muted-foreground py-2 pr-2 gap-1 text-[#007200] bg-muted-background pl-4 hover:bg-[#bfbfbf] hover:cursor-pointer'
            onClick={() => handleVote(true, symbol)}
          >
            <KeyboardDoubleArrowUp className='!text-lg' />{' '}
            <p>Upvote &middot; {votes.upVotes}</p>
          </div>
          <div
            className='pl-2 py-2 flex items-center gap-1 text-[#b20000] bg-muted-background pr-4 hover:bg-[#bfbfbf] hover:cursor-pointer'
            onClick={() => handleVote(false, symbol)}
          >
            <KeyboardDoubleArrowDown className='!text-lg' />
            Downvote
          </div>
        </div>
      </div>
    </div>
  );
};
