"use client";

import { ReactNode } from "react";

interface MobileTableProps {
  headers: string[];
  children: ReactNode;
  className?: string;
}

interface MobileTableRowProps {
  children: ReactNode;
  className?: string;
}

interface MobileTableCellProps {
  header: string;
  children: ReactNode;
  className?: string;
  hideOnMobile?: boolean;
}

export function MobileTable({ headers, children, className }: MobileTableProps) {
  return (
    <div className={`w-full ${className}`}>
      {/* Desktop Table */}
      <div className="hidden lg:block">
        <table className="w-full">
          <thead>
            <tr className="bg-muted/50">
              {headers.map((header, index) => (
                <th
                  key={index}
                  className="px-4 py-3 text-left text-[10px] font-bold tracking-wider uppercase text-muted-foreground"
                >
                  {header}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>{children}</tbody>
        </table>
      </div>

      {/* Mobile Card Layout */}
      <div className="lg:hidden space-y-3">
        {children}
      </div>
    </div>
  );
}

export function MobileTableRow({ children, className }: MobileTableRowProps) {
  return (
    <>
      {/* Desktop Row */}
      <tr className={`border-b transition-colors hover:bg-muted/50 ${className}`}>
        {children}
      </tr>

      {/* Mobile Card - This will be handled by MobileTableCell */}
    </>
  );
}

export function MobileTableCell({ 
  header, 
  children, 
  className, 
  hideOnMobile = false 
}: MobileTableCellProps) {
  return (
    <>
      {/* Desktop Cell */}
      <td className={`px-4 py-3 ${hideOnMobile ? 'hidden lg:table-cell' : ''} ${className}`}>
        {children}
      </td>

      {/* Mobile Card Item */}
      <div className={`lg:hidden ${hideOnMobile ? 'hidden' : ''}`}>
        <div className="bg-card rounded-lg border p-4 space-y-2">
          <div className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">
            {header}
          </div>
          <div className="text-sm">
            {children}
          </div>
        </div>
      </div>
    </>
  );
}

// Helper component to group mobile cells into cards
export function MobileCardGroup({ children }: { children: ReactNode }) {
  return (
    <div className="lg:hidden">
      <div className="bg-card rounded-lg border overflow-hidden">
        <div className="divide-y">
          {children}
        </div>
      </div>
    </div>
  );
}
