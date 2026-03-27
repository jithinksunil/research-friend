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

type CompanyComment = {
  id: number;
  text: string;
  createdAt: string;
  user: {
    id: string;
    firstName: string;
    lastName: string | null;
  };
};

type CommentsResponse =
  | {
      data: CompanyComment[];
    }
  | {
      message: string;
    };

type CreateCommentResponse =
  | {
      data: CompanyComment;
    }
  | {
      message: string;
    };

export const VoteButton = ({ symbol }: { symbol: string }) => {
  const [votes, setVotes] = useState({ upVotes: 0, downVotes: 0 });
  const [isCommentsOpen, setIsCommentsOpen] = useState(false);
  const [comments, setComments] = useState<CompanyComment[]>([]);
  const [commentText, setCommentText] = useState('');
  const [isCommentsLoading, setIsCommentsLoading] = useState(false);
  const [isSubmittingComment, setIsSubmittingComment] = useState(false);

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

  const fetchComments = useCallback(async () => {
    setIsCommentsLoading(true);
    try {
      const response = await fetch(`/api/dashboard/${encodeURIComponent(symbol)}/comments`, {
        cache: 'no-store',
        credentials: 'include',
      });
      const responseJson = (await response.json().catch(() => null)) as CommentsResponse | null;

      if (!response.ok || !responseJson || !('data' in responseJson)) {
        throw new Error(
          responseJson && 'message' in responseJson
            ? responseJson.message
            : 'Failed to fetch comments',
        );
      }

      setComments(responseJson.data);
    } catch {
      toastMessage.error('Error while fetching comments');
    } finally {
      setIsCommentsLoading(false);
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

  const handleOpenComments = async () => {
    setIsCommentsOpen(true);
    await fetchComments();
  };

  const handleSubmitComment = async () => {
    const normalizedComment = commentText.trim();

    if (!normalizedComment) {
      toastMessage.error('Please enter a comment');
      return;
    }

    setIsSubmittingComment(true);
    try {
      const response = await fetch(`/api/dashboard/${encodeURIComponent(symbol)}/comments`, {
        method: 'POST',
        credentials: 'include',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ text: normalizedComment }),
      });
      const responseJson = (await response
        .json()
        .catch(() => null)) as CreateCommentResponse | null;

      if (!response.ok || !responseJson || !('data' in responseJson)) {
        throw new Error(
          responseJson && 'message' in responseJson
            ? responseJson.message
            : 'Failed to create comment',
        );
      }

      setComments((currentComments) => [responseJson.data, ...currentComments]);
      setCommentText('');
      toastMessage.success('Comment submitted');
    } catch {
      toastMessage.error('Error while submitting comment');
    } finally {
      setIsSubmittingComment(false);
    }
  };

  useEffect(() => {
    fetchVotes();
  }, [fetchVotes]);

  return (
    <>
      <div className="flex gap-4 items-center justify-between">
        <p>
          {/* <span className="font-bold text-primary">Wooping 50</span> Investors downloaded the detailed
          report */}
        </p>
        <div className="flex items-center gap-4">
          <button
            type="button"
            className="font-bold text-muted-foreground text-sm hover:cursor-pointer hover:text-primary"
            onClick={handleOpenComments}
          >
            Comments
          </button>{' '}
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
        </div>{' '}
      </div>

      {isCommentsOpen ? (
        <div className="fixed inset-0 z-[80] flex items-center justify-center bg-black/30 px-4">
          <div className="w-full max-w-2xl rounded-2xl bg-white p-6 shadow-2xl">
            <div className="flex items-start justify-between gap-4">
              <div>
                <h3 className="text-lg font-semibold">Comments for {symbol}</h3>
                <p className="mt-1 text-sm text-muted-foreground">
                  Share what you think about this company.
                </p>
              </div>
              <button
                type="button"
                className="hover:cursor-pointer text-sm font-medium text-muted-foreground hover:text-foreground"
                onClick={() => setIsCommentsOpen(false)}
              >
                Close
              </button>
            </div>

            <div className="mt-4">
              <textarea
                value={commentText}
                onChange={(event) => setCommentText(event.target.value)}
                placeholder="Write your comment here..."
                className="min-h-[140px] w-full resize-none rounded-xl border border-gray-200 p-4 text-sm outline-none focus:border-primary"
                maxLength={1000}
              />
              <div className="mt-2 text-right text-xs text-muted-foreground">
                {commentText.length}/1000
              </div>
            </div>

            <div className="mt-4 flex justify-end gap-3">
              <button
                type="button"
                className="hover:cursor-pointer rounded-lg border border-gray-200 px-4 py-2 text-sm font-medium text-muted-foreground"
                onClick={() => setIsCommentsOpen(false)}
              >
                Cancel
              </button>
              <button
                type="button"
                className="hover:cursor-pointer rounded-lg bg-primary px-4 py-2 text-sm font-medium text-white disabled:cursor-not-allowed disabled:opacity-60"
                onClick={handleSubmitComment}
                disabled={isSubmittingComment}
              >
                {isSubmittingComment ? 'Submitting...' : 'Submit'}
              </button>
            </div>

            <div className="mt-6">
              <h4 className="text-sm font-semibold text-foreground">Recent comments</h4>
              <div className="mt-3 max-h-[280px] space-y-3 overflow-y-auto pr-1">
                {isCommentsLoading ? (
                  <div className="text-sm text-muted-foreground">Loading comments...</div>
                ) : comments.length ? (
                  comments.map((comment) => (
                    <div key={comment.id} className="rounded-xl border border-gray-200 p-4">
                      <div className="flex items-center justify-between gap-3">
                        <div className="text-sm font-semibold text-foreground">
                          {comment.user.firstName}
                          {comment.user.lastName ? ` ${comment.user.lastName}` : ''}
                        </div>
                        <div className="text-xs text-muted-foreground">
                          {new Date(comment.createdAt).toLocaleString()}
                        </div>
                      </div>
                      <p className="mt-2 text-sm leading-relaxed text-muted-foreground">
                        {comment.text}
                      </p>
                    </div>
                  ))
                ) : (
                  <div className="rounded-xl border border-dashed border-gray-200 p-4 text-sm text-muted-foreground">
                    No comments yet. Be the first to share one.
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      ) : null}
    </>
  );
};
