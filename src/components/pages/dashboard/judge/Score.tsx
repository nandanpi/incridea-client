import createToast from '@/src/components/toast';
import { AddScoreDocument, GetScoreDocument } from '@/src/generated/generated';
import { useMutation, useQuery } from '@apollo/client';
import { useEffect, useState } from 'react';

const Score = ({
  teamId,
  criteriaId,
  roundNo,
}: {
  teamId: string;
  criteriaId: string;
  roundNo: number;
}) => {
  const { data, loading, error } = useQuery(GetScoreDocument, {
    variables: {
      criteriaId: criteriaId,
      teamId: teamId,
      roundNo,
    },
    skip: !roundNo || !teamId || !criteriaId,
  });

  const [score, setScore] = useState<string>('0');

  // as soon as data is loaded, set score
  useEffect(() => {
    if (data?.getScore?.__typename === 'QueryGetScoreSuccess') {
      setScore(data.getScore.data.score);
    } else {
        setScore('0');
    }
  }, [data?.getScore]);

  const [updateScore, { loading: updateScoreLoading }] = useMutation(
    AddScoreDocument,
    {
      refetchQueries: ['GetScore'],
      awaitRefetchQueries: true,
    }
  );

  const handleUpdateScore = () => {
    // check if score is really changed before updating
    if (
      data?.getScore.__typename === 'QueryGetScoreSuccess' &&
      data.getScore.data.score === score
    ) {
      return;
    }
    let promise = updateScore({
      variables: {
        criteriaId: Number(criteriaId),
        teamId: Number(teamId),
        // if input is empty, set score to 0
        score: score ? score : '0',
      },
    });
    createToast(promise, 'Updating score...');
  };

  return (
    <div className="flex items-center text-lg gap-2">
      <input
        disabled={loading || updateScoreLoading}
        value={score}
        onChange={(e) => setScore(e.target.value)}
        // update score when input loses focus [better alternative to extra submit button and unnecessary mutations in onChange]
        onBlur={() => handleUpdateScore()}
        type="number"
        className="[appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none
					 				w-16 bg-white/10 min-h-[24px] rounded-lg text-center text-white/90 focus:ring-2 ring-white/50 outline-none"
        //first few classes to hide default input type=number buttons
      />
    </div>
  );
};

export default Score;
