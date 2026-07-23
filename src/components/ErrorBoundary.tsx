import { Component, type ReactNode } from 'react'
import styles from './ErrorBoundary.module.css'

interface Props {
  children: ReactNode
}

interface State {
  hasError: boolean
}

export class ErrorBoundary extends Component<Props, State> {
  state: State = { hasError: false }

  static getDerivedStateFromError(): State {
    return { hasError: true }
  }

  render() {
    if (this.state.hasError) {
      return (
        <div className={styles.fallback}>
          <h2 className={styles.title}>Bir şeyler ters gitti</h2>
          <p className={styles.message}>
            Uygulama beklenmedik bir hata ile karşılaştı.
          </p>
          <button
            className={styles.button}
            onClick={() => this.setState({ hasError: false })}
          >
            Tekrar Dene
          </button>
        </div>
      )
    }

    return this.props.children
  }
}
