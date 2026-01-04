import React, {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useRef,
  useState,
  useMemo,
} from 'react'

const StepperContext = createContext(null)

function makeUid() {
  return `${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 9)}`
}

export function Stepper({
  children,
  initial = 0,
  activeIndex, // controlled
  onChange,
  linear = false, // if true, prevent skipping ahead
}) {
  const [steps, setSteps] = useState([])
  const [uncontrolledActive, setUncontrolledActive] = useState(initial)
  const active = typeof activeIndex === 'number' ? activeIndex : uncontrolledActive
  const [data, setData] = useState({})
  const [statuses, setStatuses] = useState({})
  const uidRef = useRef(0)

  const register = useCallback((meta) => {
    const id = uidRef.current++
    const uid = makeUid()
    setSteps((s) => [...s, { id, uid, meta }])
    return id
  }, [])

  const unregister = useCallback((id) => {
    setSteps((s) => s.filter((x) => x.id !== id))
  }, [])

  const setStatus = useCallback((index, status) => {
    setStatuses((prev) => ({ ...prev, [index]: status }))
  }, [])

  const validateStep = useCallback(
    async (index) => {
      const step = steps[index]
      if (!step) return true
      const fn = step.meta?.validate
      if (!fn) return true
      try {
        const res = await fn(data)
        return res !== false
      } catch (e) {
        return false
      }
    },
    [steps, data]
  )

  const setActive = useCallback(
    (index) => {
      if (index < 0 || index >= steps.length) return
      if (typeof activeIndex === 'number') {
        onChange?.(index)
      } else {
        setUncontrolledActive(index)
        onChange?.(index)
      }
    },
    [steps.length, activeIndex, onChange]
  )

  const goTo = useCallback(
    async (index, { force = false } = {}) => {
      if (index < 0 || index >= steps.length) return
      const target = steps[index]
      if (!target || target.meta?.disabled) return
      if (linear && !force) {
        const max = Math.max(...Object.keys(statuses).filter((k) => statuses[k] === 'complete').map(Number), -1)
        if (index > max + 1) return
      }
      setActive(index)
    },
    [steps, linear, statuses, setActive]
  )

  const goNext = useCallback(
    async (opts) => {
      const valid = await validateStep(active)
      if (!valid) return false
      const next = Math.min(steps.length - 1, active + 1)
      await goTo(next, opts)
      return true
    },
    [validateStep, active, steps.length, goTo]
  )

  const goPrev = useCallback(() => setActive(Math.max(0, active - 1)), [active, setActive])

  const api = useMemo(
    () => ({
      register,
      unregister,
      steps,
      active,
      goTo,
      goNext,
      goPrev,
      data,
      setData,
      validateStep,
      setStatus,
      statuses,
    }),
    [register, unregister, steps, active, goTo, goNext, goPrev, data, setData, validateStep, setStatus, statuses]
  )

  return <StepperContext.Provider value={api}>{children}</StepperContext.Provider>
}

export function useStepper() {
  const ctx = useContext(StepperContext)
  if (!ctx) throw new Error('useStepper must be used within a Stepper')
  return ctx
}

export function Step({ children, title, validate, disabled }) {
  const ctx = useStepper()
  const myId = useRef(null)

  useEffect(() => {
    myId.current = ctx.register({ title, validate, disabled })
    return () => ctx.unregister(myId.current)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  const index = ctx.steps.findIndex((s) => s.id === myId.current)
  const step = ctx.steps[index]
  const uid = step?.uid || `step-${index}`
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
    status: ctx.statuses[index],
    setStatus: (s) => ctx.setStatus(index, s),
  }

  const content = typeof children === 'function' ? children(renderProps) : children

  return (
    <div
      role="tabpanel"
      id={`panel-${uid}`}
      aria-labelledby={`tab-${uid}`}
      hidden={!active}
      className="stepper-panel"
    >
      {content}
    </div>
  )
}

export function StepNav({ renderLabel }) {
  const ctx = useStepper()
  const refs = useRef([])

  useEffect(() => {
    refs.current = refs.current.slice(0, ctx.steps.length)
  }, [ctx.steps.length])

  const focusIndex = useRef(ctx.active)

  useEffect(() => {
    focusIndex.current = ctx.active
  }, [ctx.active])

  const onKeyDown = (e, i) => {
    if (e.key === 'ArrowRight') {
      e.preventDefault()
      const n = (i + 1) % ctx.steps.length
      refs.current[n]?.focus()
      focusIndex.current = n
    } else if (e.key === 'ArrowLeft') {
      e.preventDefault()
      const n = (i - 1 + ctx.steps.length) % ctx.steps.length
      refs.current[n]?.focus()
      focusIndex.current = n
    } else if (e.key === 'Home') {
      e.preventDefault()
      refs.current[0]?.focus()
      focusIndex.current = 0
    } else if (e.key === 'End') {
      e.preventDefault()
      refs.current[ctx.steps.length - 1]?.focus()
      focusIndex.current = ctx.steps.length - 1
    } else if (e.key === 'Enter' || e.key === ' ') {
      e.preventDefault()
      ctx.goTo(i)
    }
  }

  return (
    <div role="tablist" aria-label="Steps" className="stepper-nav">
      {ctx.steps.map((s, i) => (
        <button
          key={s.uid}
          id={`tab-${s.uid}`}
          ref={(el) => (refs.current[i] = el)}
          role="tab"
          aria-controls={`panel-${s.uid}`}
          aria-selected={ctx.active === i}
          tabIndex={ctx.active === i ? 0 : -1}
          onClick={() => ctx.goTo(i)}
          onKeyDown={(e) => onKeyDown(e, i)}
          disabled={s.meta?.disabled}
          className={`stepper-tab ${ctx.active === i ? 'active' : ''} ${s.meta?.disabled ? 'disabled' : ''}`}
        >
          {renderLabel ? renderLabel({ index: i, title: s.meta.title, status: ctx.statuses[i] }) : s.meta.title || `Step ${i + 1}`}
        </button>
      ))}
    </div>
  )
}

export function StepIndicator({ showProgress = true }) {
  const ctx = useStepper()
  const total = ctx.steps.length || 1
  const percent = Math.round(((ctx.active + 1) / total) * 100)
  return (
    <div className="stepper-indicator" aria-hidden={!showProgress}>
      <div className="progress-bar">
        <div className="progress-fill" style={{ width: `${percent}%` }} />
      </div>
      <div className="progress-text">{percent}%</div>
    </div>
  )
}

export default {
  Stepper,
  Step,
  StepNav,
  StepIndicator,
  useStepper,
}
