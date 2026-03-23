import { Outlet } from 'react-router-dom'
import { WriteUpPageTabs } from '../../components/writeUp'

export function WriteUpLayout() {
  return (
    <div>
      <WriteUpPageTabs />
      <Outlet />
    </div>
  )
}
