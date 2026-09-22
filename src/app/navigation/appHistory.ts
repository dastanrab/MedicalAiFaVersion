import { useCallback } from 'react';
import { useNavigate, useSearchParams, type NavigateFunction } from 'react-router';

export function getHistoryIndex(): number {
  const idx = window.history.state?.idx;
  return typeof idx === 'number' ? idx : 0;
}

export function goBack(
  navigate: NavigateFunction,
  fallback = '/home',
  fallbackState?: unknown,
) {
  if (getHistoryIndex() > 0) {
    navigate(-1);
    return;
  }

  navigate(fallback, {
    replace: true,
    ...(fallbackState !== undefined ? { state: fallbackState } : {}),
  });
}

export function useWizardStep(defaultStep = 1) {
  const [params, setParams] = useSearchParams();
  const navigate = useNavigate();
  const raw = Number(params.get('step'));
  const step =
    Number.isFinite(raw) && raw >= defaultStep ? Math.floor(raw) : defaultStep;

  const setStep = useCallback(
    (next: number | ((prev: number) => number)) => {
      const value = typeof next === 'function' ? next(step) : next;
      if (value === step) return;

      if (value < step) {
        navigate(-Math.max(1, step - value));
        return;
      }

      setParams(
        (prev) => {
          const nextParams = new URLSearchParams(prev);
          if (value <= defaultStep) {
            nextParams.delete('step');
          } else {
            nextParams.set('step', String(value));
          }
          return nextParams;
        },
        { replace: false },
      );
    },
    [defaultStep, navigate, setParams, step],
  );

  return [step, setStep] as const;
}
