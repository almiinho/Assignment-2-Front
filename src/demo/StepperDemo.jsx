import React from 'react'
import { Stepper, Step, StepNav, StepIndicator, useStepper } from '../lib/Stepper'

function Summary() {
  const { data } = useStepper()
  return (
    <div>
      <h3>Summary</h3>
      <pre>{JSON.stringify(data, null, 2)}</pre>
    </div>
  )
}

export default function StepperDemo() {
  return (
    <div className="demo">
      <h2>Multi-step Form (Compound + Render Props)</h2>
      <Stepper initial={0} linear={false}>
        <div className="stepper-header">
          <h3>Registration</h3>
          <StepIndicator />
        </div>

        <StepNav renderLabel={({ title, status }) => (
          <span className="label">{title} {status === 'complete' ? '✓' : ''}</span>
        )} />

        <div className="step-content">
          <Step title="Account" validate={(data) => !!data.name && data.name.length > 1}>
            {({ active, data, setData, goNext, setStatus }) => (
              <div className="card" hidden={!active}>
                <label className="field">
                  <div className="field-label">Name</div>
                  <input className="input" value={data.name || ''} onChange={(e) => setData({ ...data, name: e.target.value })} />
                </label>
                <div className="controls">
                  <button
                    onClick={async () => {
                      const ok = await goNext()
                      if (ok) setStatus('complete')
                    }}
                    className="btn primary"
                  >
                    Next
                  </button>
                </div>
              </div>
            )}
          </Step>

          <Step title="Contact">
            {({ active, data, setData, goNext, goPrev, setStatus }) => (
              <div className="card" hidden={!active}>
                <label className="field">
                  <div className="field-label">Email</div>
                  <input className="input" value={data.email || ''} onChange={(e) => setData({ ...data, email: e.target.value })} />
                </label>
                <div className="controls">
                  <button onClick={goPrev} className="btn">Back</button>
                  <button
                    onClick={async () => {
                      const ok = await goNext()
                      if (ok) setStatus('complete')
                    }}
                    className="btn primary"
                  >
                    Next
                  </button>
                </div>
              </div>
            )}
          </Step>

          <Step title="Confirm">
            {({ active, data, goPrev }) => (
              <div className="card" hidden={!active}>
                <h4>Confirm</h4>
                <p>
                  <strong>Name:</strong> {data.name}
                </p>
                <p>
                  <strong>Email:</strong> {data.email}
                </p>
                <div className="controls">
                  <button onClick={goPrev} className="btn">Back</button>
                  <button onClick={() => alert('Submitted!')} className="btn primary">Submit</button>
                </div>
              </div>
            )}
          </Step>

          <Step title="Summary">
            {({ active }) => <div className="card" hidden={!active}>{<Summary />}</div>}
          </Step>
        </div>
      </Stepper>
    </div>
  )
}
