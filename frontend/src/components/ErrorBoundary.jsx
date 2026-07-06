import { Component } from 'react'
import { AlertTriangle, RefreshCw, RotateCcw } from 'lucide-react'

export default class ErrorBoundary extends Component {
  constructor(props) {
    super(props)
    this.state = { hasError: false, error: null }
  }

  static getDerivedStateFromError(error) {
    return { hasError: true, error }
  }

  componentDidCatch(error, errorInfo) {
    // Production: hook Sentry / similar error tracking here.
    console.error('ErrorBoundary caught an error:', error, errorInfo)
  }

  handleTryAgain = () => {
    this.setState({ hasError: false, error: null })
  }

  handleReload = () => {
    window.location.reload()
  }

  render() {
    if (this.state.hasError) {
      return (
        <div className="mx-auto flex min-h-[60vh] max-w-lg flex-col items-center justify-center px-4 py-16 text-center">
          <div className="w-full rounded-2xl border border-[color:var(--sp-border)] bg-white p-8 shadow-sm sm:p-10">
            <span
              className="mx-auto grid h-14 w-14 place-items-center rounded-full bg-red-50 text-red-600"
              aria-hidden="true"
            >
              <AlertTriangle size={28} strokeWidth={2} />
            </span>
            <h1 className="mt-5 font-sora text-2xl font-semibold tracking-tight text-[color:var(--sp-text)]">
              Something went wrong
            </h1>
            <p className="mt-2 text-sm leading-relaxed text-[color:var(--sp-text-secondary)]">
              We hit an unexpected error. Your data is safe — try reloading.
            </p>
            <div className="mt-6 flex flex-col gap-2 sm:flex-row sm:justify-center">
              <button
                type="button"
                onClick={this.handleReload}
                className="sp-focus-ring inline-flex items-center justify-center gap-2 rounded-lg bg-[color:var(--sp-primary)] px-5 py-2.5 text-sm font-semibold text-white shadow-sm transition-colors hover:bg-[color:var(--sp-primary-600)]"
              >
                <RefreshCw size={16} aria-hidden="true" />
                Reload page
              </button>
              <button
                type="button"
                onClick={this.handleTryAgain}
                className="sp-focus-ring inline-flex items-center justify-center gap-2 rounded-lg border border-[color:var(--sp-border)] bg-white px-5 py-2.5 text-sm font-medium text-[color:var(--sp-text-secondary)] transition-colors hover:border-[color:var(--sp-primary)] hover:text-[color:var(--sp-primary)]"
              >
                <RotateCcw size={16} aria-hidden="true" />
                Try again
              </button>
            </div>
          </div>
        </div>
      )
    }

    return this.props.children
  }
}
