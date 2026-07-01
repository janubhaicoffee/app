import OutletGuard from "@/components/OutletGuard"
import OutletSidebar from "@/components/outlet/OutletSidebar"
import "./outlet.css"

export default function OutletLayout({ children }) {
  return (
    <OutletGuard>
      <div className="outlet-layout-wrapper">
        <OutletSidebar />
        <main className="outlet-main-content">
          {children}
        </main>
      </div>
    </OutletGuard>
  )
}
