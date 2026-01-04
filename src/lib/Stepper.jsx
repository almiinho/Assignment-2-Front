import React, { createContext, useCallback, useContext, useEffect, useRef, useState } from 'react'

const StepperContext = createContext(null)

export function Stepper({ children, initial = 0, onChange }) {
  const [steps, setSteps] = useState([])
  const [active, setActive] = useState(initial)
  const [data, setData] = useState({})
  const idRef = useRef(0)

  const register = useCallback((meta) => {
    const id = idRef.current++
    setSteps((s) => [...s, { id, meta }])
    return id
  }, [])

  const unregister = useCallback((id) => {
    setSteps((s) => s.filter((x) => x.id !== id))
  }, [])

  const goTo = useCallback(
    (index) => {
      if (index < 0 || index >= steps.length) return
      setActive(index)
      onChange?.(index)
    },
    [steps.length, onChange]
  )

  const goNext = useCallback(() => goTo(Math.min(steps.length - 1, active + 1)), [goTo, steps.length, active])
  const goPrev = useCallback(() => goTo(Math.max(0, active - 1)), [goTo, active])

  return (
    <StepperContext.Provider value={{ register, unregister, steps, active, goTo, goNext, goPrev, data, setData }}>
      {children}
    </StepperContext.Provider>
  )
}

export function useStepper() {
  const ctx = useContext(StepperContext)
  if (!ctx) throw new Error('useStepper must be used within a Stepper')
  return ctx
}

export function Step({ children, title }) {
  const ctx = useStepper()
  const myId = useRef(null)

  useEffect(() => {
    myId.current = ctx.register({ title })
    return () => ctx.unregister(myId.current)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  const index = ctx.steps.findIndex((s) => s.id === myId.current)
  const active = index === ctx.active

  const renderProps = {
    active,
    index,
    goNext: ctx.goNext,
    goPrev: ctx.goPrev,
    goTo: ctx.goTo,
    isFirst: index === 0,
    isLast: index === ctx.steps.length - 1,
    data: ctx.data,
    setData: ctx.setData,
  }

  if (typeof children === 'function') return children(renderProps)
  return active ? children : null
}

export function StepNav({ renderLabel }) {
  const ctx = useStepper()
  const refs = useRef([])

  useEffect(() => {
    refs.current = refs.current.slice(0, ctx.steps.length)
  }, [ctx.steps.length])

  const onKeyDown = (e, i) => {
    if (e.key === 'ArrowRight') {
      e.preventDefault()
      const n = (i + 1) % ctx.steps.length
      refs.current[n]?.focus()
      ctx.goTo(n)
    } else if (e.key === 'ArrowLeft') {
      e.preventDefault()
      const n = (i - 1 + ctx.steps.length) % ctx.steps.length
      refs.current[n]?.focus()
      ctx.goTo(n)
    } else if (e.key === 'Home') {
      e.preventDefault()
      refs.current[0]?.focus()
      ctx.goTo(0)
    } else if (e.key === 'End') {
      e.preventDefault()
      refs.current[ctx.steps.length - 1]?.focus()
      ctx.goTo(ctx.steps.length - 1)
    }
  }

  return (
    <div role="tablist" aria-label="Steps" className="stepper-nav">
      {ctx.steps.map((s, i) => (
        <button
          key={s.id}
          ref={(el) => (refs.current[i] = el)}
          role="tab"
          aria-selected={ctx.active === i}
          tabIndex={ctx.active === i ? 0 : -1}
          onClick={() => ctx.goTo(i)}
          onKeyDown={(e) => onKeyDown(e, i)}
          className={ctx.active === i ? 'active' : ''}
        >
          {renderLabel ? renderLabel({ index: i, title: s.meta.title }) : s.meta.title || `Step ${i + 1}`}
        </button>
      ))}
    </div>
  )
}

export default {
  Stepper,
  Step,
  StepNav,
}
