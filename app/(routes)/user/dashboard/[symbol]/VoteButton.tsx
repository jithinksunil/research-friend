'use client';

import { toastMessage } from '@/lib';
import { useComments, useCommentMutation, useVoteMutation, useVotes } from '@/hooks/user/dashboard';
import { KeyboardDoubleArrowDown, KeyboardDoubleArrowUp } from '@mui/icons-material';
import { useState } from 'react';

export const VoteButton = ({ symbol }: { symbol: string }) => {
  const [isCommentsOpen, setIsCommentsOpen] = useState(false);
  const [commentText, setCommentText] = useState('');
  const [isSubmittingComment, setIsSubmittingComment] = useState(false);

  const { data: votes = { upVotes: 0, downVotes: 0 } } = useVotes(symbol);
  const { data: comments = [] } = useComments(symbol);
  const voteMutation = useVoteMutation();
  const commentMutation = useCommentMutation();

  const handleVote = async (vote: boolean, companySymbol: string) => {
    try {
      await voteMutation.mutateAsync({ symbol: companySymbol, vote });
      toastMessage.success(vote ? 'Up voted' : 'Down voted');
    } catch {
      toastMessage.error('Error while voting');
    }
  };

  const handleOpenComments = async () => {
    setIsCommentsOpen(true);
  };

  const handleSubmitComment = async () => {
    const normalizedComment = commentText.trim();

    if (!normalizedComment) {
      toastMessage.error('Please enter a comment');
      return;
    }

    setIsSubmittingComment(true);
    try {
      await commentMutation.mutateAsync({ symbol, text: normalizedComment });
      setCommentText('');
      toastMessage.success('Comment submitted');
    } catch {
      toastMessage.error('Error while submitting comment');
    } finally {
      setIsSubmittingComment(false);
    }
  };

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
                {comments.length ? (
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
