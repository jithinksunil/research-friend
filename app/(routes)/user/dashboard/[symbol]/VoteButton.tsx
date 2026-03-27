'use client';

import { registerVote } from '@/app/actions/user';
import { toastMessage } from '@/lib';
import { KeyboardDoubleArrowDown, KeyboardDoubleArrowUp } from '@mui/icons-material';
import { useCallback, useEffect, useState } from 'react';

type VotesResponse =
  | {
      data: {
        upVotes: number;
        downVotes: number;
      };
    }
  | {
      message: string;
    };

export const VoteButton = ({ symbol }: { symbol: string }) => {
  const [votes, setVotes] = useState({ upVotes: 0, downVotes: 0 });

  const fetchVotes = useCallback(async () => {
    try {
      const response = await fetch(`/api/dashboard/${encodeURIComponent(symbol)}/votes`, {
        cache: 'no-store',
        credentials: 'include',
      });
      const responseJson = (await response.json().catch(() => null)) as VotesResponse | null;

      if (!response.ok || !responseJson || !('data' in responseJson)) {
        throw new Error(
          responseJson && 'message' in responseJson
            ? responseJson.message
            : 'Failed to fetch votes',
        );
      }

      setVotes(responseJson.data);
    } catch {
      toastMessage.error('Error while fetching votes');
    }
  }, [symbol]);

  const handleVote = async (vote: boolean, companySymbol: string) => {
    try {
      const res = await registerVote({ symbol: companySymbol, vote });
      // @ts-ignore
      if (!res.okay) throw new Error(res.error);
      await fetchVotes();
      toastMessage.success(vote ? 'Up voted' : 'Down voted');
    } catch {
      toastMessage.error('Error while voting');
    }
  };

  useEffect(() => {
    fetchVotes();
  }, [fetchVotes]);

  return (
    <div className="flex gap-4 items-center justify-between">
      <p>
        <span className="font-bold text-primary">Wooping 50</span> Investors downloaded the detailed
        report
      </p>
      <div className="flex items-center gap-4">
        <div className="font-bold text-muted-foreground text-sm hover:cursor-pointer hover:text-primary">
          Comments
        </div>{' '}
        <div className="flex items-center rounded-full text-sm overflow-hidden">
          <div
            className="flex items-center border-r border-muted-foreground py-2 pr-2 gap-1 text-[#007200] bg-muted-background pl-4 hover:bg-[#bfbfbf] hover:cursor-pointer"
            onClick={() => handleVote(true, symbol)}
          >
            <KeyboardDoubleArrowUp className="!text-lg" /> <p>Upvote &middot; {votes.upVotes}</p>
          </div>
          <div
            className="pl-2 py-2 flex items-center gap-1 text-[#b20000] bg-muted-background pr-4 hover:bg-[#bfbfbf] hover:cursor-pointer"
            onClick={() => handleVote(false, symbol)}
          >
            <KeyboardDoubleArrowDown className="!text-lg" />
            Downvote
          </div>
        </div>
      </div>
    </div>
  );
};
