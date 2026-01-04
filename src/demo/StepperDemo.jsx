import React from 'react'
import { Stepper, Step, StepNav, useStepper } from '../lib/Stepper'

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
      <Stepper initial={0}>
        <StepNav />

        <div className="step-content">
          <Step title="Account">
            {({ active, data, setData, goNext }) => (
              <div hidden={!active}>
                <label>
                  Name: <input value={data.name || ''} onChange={(e) => setData({ ...data, name: e.target.value })} />
                </label>
                <div className="controls">
                  <button onClick={goNext}>Next</button>
                </div>
              </div>
            )}
          </Step>

          <Step title="Contact">
            {({ active, data, setData, goNext, goPrev }) => (
              <div hidden={!active}>
                <label>
                  Email: <input value={data.email || ''} onChange={(e) => setData({ ...data, email: e.target.value })} />
                </label>
                <div className="controls">
                  <button onClick={goPrev}>Back</button>
                  <button onClick={goNext}>Next</button>
                </div>
              </div>
            )}
          </Step>

          <Step title="Confirm">
            {({ active, data, goPrev }) => (
              <div hidden={!active}>
                <h3>Confirm</h3>
                <p>
                  <strong>Name:</strong> {data.name}
                </p>
                <p>
                  <strong>Email:</strong> {data.email}
                </p>
                <div className="controls">
                  <button onClick={goPrev}>Back</button>
                  <button onClick={() => alert('Submitted!')}>Submit</button>
                </div>
              </div>
            )}
          </Step>

          <Step title="Summary">
            {({ active }) => <div hidden={!active}>{<Summary />}</div>}
          </Step>
        </div>
      </Stepper>
    </div>
  )
}
