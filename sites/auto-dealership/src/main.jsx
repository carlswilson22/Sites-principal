import { StoreAppBoundary } from '../../../packages/merchant-core/src/components/common/StoreAppBoundary';
import React from 'react'
import ReactDOM from 'react-dom/client'
import App from './App.jsx'
import './index.css'

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <StoreAppBoundary><App /></StoreAppBoundary>
  </React.StrictMode>,
)
