import { ReactNode } from 'react'
import { Bounce, ToastContainer } from 'react-toastify'

import 'react-toastify/dist/ReactToastify.css'

export const ToastWrapper = ({ children }: { children: ReactNode }) => {
  return (
    <>
      {children}
      <ToastContainer
        autoClose={5000}
        className={'customToastify'}
        draggable
        hideProgressBar
        icon={false}
        pauseOnFocusLoss
        pauseOnHover
        position={'top-right'}
        rtl={false}
        stacked
        theme={'colored'}
        toastClassName={'customWrapperToastify'}
        transition={Bounce}
      />
    </>
  )
}
