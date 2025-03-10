/**
 * Copyright (c) Meta Platforms, Inc. and affiliates.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 *
 */

import type {LexicalEditor} from 'lexical';

import {useLexicalComposerContext} from '@lexical/react/LexicalComposerContext';
import {useMemo, useRef, useState} from 'react';
import useLayoutEffect from 'shared/useLayoutEffect';

export type LexicalSubscription<T> = {
  initialValueFn: () => T;
  subscribe: (callback: (value: T) => void) => () => void;
};

/**
 * Shortcut to Lexical subscriptions when values are used for render.
 * @param subscription - The function to create the {@link LexicalSubscription}. This function's identity must be stable (e.g. defined at module scope or with useCallback).
 */
export function useLexicalSubscription<T>(
  subscription: (editor: LexicalEditor) => LexicalSubscription<T>,
): T {
  const [editor] = useLexicalComposerContext();
  const initializedSubscription = useMemo(
    () => subscription(editor),
    [editor, subscription],
  );
  const [value, setValue] = useState<T>(() =>
    initializedSubscription.initialValueFn(),
  );
  const valueRef = useRef<T>(value);
  useLayoutEffect(() => {
    const {initialValueFn, subscribe} = initializedSubscription;
    const currentValue = initialValueFn();
    if (valueRef.current !== currentValue) {
      valueRef.current = currentValue;
      setValue(currentValue);
    }

    return subscribe((newValue: T) => {
      valueRef.current = newValue;
      setValue(newValue);
    });
  }, [initializedSubscription, subscription]);

  return value;
}
