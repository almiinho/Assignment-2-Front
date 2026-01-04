import React from 'react'
import { Stepper, Step, StepNav, StepIndicator, useStepper } from '../lib/Stepper'

function Summary() {
  const { data } = useStepper()
  return (
    <div className="summary">
      <h3>Registration Complete</h3>
      <p style={{color: '#666', marginBottom: '20px'}}>Here's a summary of your information:</p>
      
      <div className="summary-grid">
        <div className="summary-item">
          <div className="summary-label">Full Name</div>
          <div className="summary-value">{data.name || '—'}</div>
        </div>
        
        <div className="summary-item">
          <div className="summary-label">Email Address</div>
          <div className="summary-value">{data.email || '—'}</div>
        </div>
      </div>
      
      <div className="summary-note">
        ✓ All information has been successfully recorded
      </div>
    </div>
  )
}

export default function StepperDemo() {
  return (
    <div className="demo">
      <h2>Registration Form</h2>
      <p style={{fontSize: '12px', color: '#666', marginBottom: '16px'}}>
        ⌨️ <strong>Keyboard Navigation:</strong> Use <kbd>Tab</kbd> to focus steps, <kbd>←</kbd><kbd>→</kbd> to navigate, <kbd>Enter</kbd> to activate
      </p>
      <Stepper initial={0} linear={false}>
        <div className="stepper-header">
          <h3>Complete Your Details</h3>
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

          <Step title="Contact" validate={(data) => {
            const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
            return !!data.email && emailRegex.test(data.email)
          }}>
            {({ active, data, setData, goNext, goPrev, setStatus }) => {
              const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
              const isValidEmail = data.email && emailRegex.test(data.email)
              return (
              <div className="card" hidden={!active}>
                <label className="field">
                  <div className="field-label">Email</div>
                  <input 
                    className={`input ${data.email && !isValidEmail ? 'error' : ''}`} 
                    value={data.email || ''} 
                    onChange={(e) => setData({ ...data, email: e.target.value })} 
                    placeholder="example@domain.com"
                  />
                  {data.email && !isValidEmail && <div className="error-text">Please enter a valid email address</div>}
                </label>
                <div className="controls">
                  <button onClick={goPrev} className="btn">Back</button>
                  <button
                    onClick={async () => {
                      const ok = await goNext()
                      if (ok) setStatus('complete')
                    }}
                    disabled={!isValidEmail}
                    className="btn primary"
                  >
                    Next
                  </button>
                </div>
              </div>
            )}}
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
