import { ReactNode } from 'react'

import { Bounce, ToastContainer } from 'react-toastify/unstyled'

import 'react-toastify/dist/ReactToastify.css'

export const ToastWrapper = ({ children }: { children: ReactNode }) => {
  return (
    <>
      {children}
      <ToastContainer
        limit={3}
        autoClose={5000}
        className={'customToastify'}
        draggable
        closeButton={false}
        hideProgressBar
        icon={false}
        pauseOnFocusLoss
        pauseOnHover
        position={'bottom-right'}
        rtl={false}
        stacked
        theme={'dark'}
        toastClassName={'customWrapperToastify'}
        transition={Bounce}
      />
    </>
  )
}
