import React, { forwardRef, useRef, useEffect } from 'react'
import type { IJodit } from 'jodit/esm/types/jodit'

import { Jodit as JoditES5 } from 'jodit/esm/index'
import type { Jodit as JoditConstructorType } from 'jodit/esm/jodit'
import 'jodit/es2021/jodit.min.css'

import 'jodit/esm/plugins/all'

export const Jodit: typeof JoditConstructorType = JoditES5

function usePrevious(value: string): string {
  const ref = useRef<string>('')
  useEffect(() => {
    ref.current = value
  }, [value])
  return ref.current
}

const JoditEditor = forwardRef<IJodit, Props>(
  (
    {
      JoditConstructor = Jodit,
      className,
      config,
      id,
      name,
      onBlur,
      onChange,
      tabIndex,
      value,
      editorRef,
    },
    ref,
  ) => {
    const textAreaRef = useRef<HTMLTextAreaElement | null>(null)
    const joditRef = useRef<IJodit | null>(null)

    useEffect(() => {
      const element = textAreaRef.current!
      const jodit = JoditConstructor.make(element, config)
      joditRef.current = jodit

      if (typeof editorRef === 'function') {
        editorRef(jodit)
      }

      return () => {
        if (jodit.isReady) {
          jodit.destruct()
        } else {
          jodit.waitForReady().then(joditInstance => joditInstance.destruct())
        }
      }
    }, [JoditConstructor, config, editorRef])

    useEffect(() => {
      if (ref) {
        if (typeof ref === 'function') {
          ref(joditRef.current)
        } else {
          ref.current = joditRef.current
        }
      }
    }, [textAreaRef, ref, joditRef])

    const preClassName = usePrevious(className ?? '')

    useEffect(() => {
      const classList = joditRef.current?.container?.classList

      if (preClassName !== className && typeof preClassName === 'string') {
        preClassName
          .split(/\s+/)
          .filter(Boolean)
          .forEach(cl => classList?.remove(cl))
      }

      if (className && typeof className === 'string') {
        className
          .split(/\s+/)
          .filter(Boolean)
          .forEach(cl => classList?.add(cl))
      }
    }, [className, preClassName])

    useEffect(() => {
      if (joditRef.current?.workplace) {
        joditRef.current.workplace.tabIndex = tabIndex || -1
      }
    }, [tabIndex])

    useEffect(() => {
      const jodit = joditRef.current
      if (!jodit?.events || !(onBlur || onChange)) {
        return
      }

      const onBlurHandler = (event: MouseEvent) =>
        onBlur && onBlur(joditRef?.current?.value ?? '', event)

      const onChangeHandler = (value: string) => onChange && onChange(value)

      // adding event handlers
      jodit.events.on('blur', onBlurHandler).on('change', onChangeHandler)

      return () => {
        // Remove event handlers
        jodit.events?.off('blur', onBlurHandler).off('change', onChangeHandler)
      }
    }, [onBlur, onChange])

    useEffect(() => {
      const jodit = joditRef.current

      const updateValue = () => {
        if (jodit && value !== undefined && jodit.value !== value) {
          jodit.value = value
        }
      }

      if (jodit) {
        if (jodit.isReady) {
          updateValue()
        } else {
          jodit.waitForReady().then(updateValue)
        }
      }
    }, [value])

    return (
      <div className={'jodit-react-container'}>
        <textarea defaultValue={value} name={name} id={id} ref={textAreaRef} />
      </div>
    )
  },
)

JoditEditor.displayName = 'JoditEditor'

export default JoditEditor
