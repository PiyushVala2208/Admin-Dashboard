"use client";

import { memo } from "react";

// Props: { technicalSpecs, attributeDefinitionMap }
function SpecificationTable({ technicalSpecs, attributeDefinitionMap }) {
  return (
    <section className="rounded-2xl border border-slate-200 bg-white overflow-hidden">
      <div className="px-4 py-3 border-b border-slate-100 bg-slate-50">
        <h3 className="text-xs font-black uppercase tracking-[0.16em] text-slate-700">
          Technical Specifications
        </h3>
      </div>
      {technicalSpecs.length > 0 ? (
        <table className="w-full text-sm">
          <tbody>
            {technicalSpecs.map((entry) => {
              const definition = attributeDefinitionMap.get(
                Number(entry.attributeId),
              );
              return (
                <tr
                  key={`${entry.attributeId}-${entry.value}`}
                  className="border-b border-slate-100 last:border-b-0"
                >
                  <th className="w-2/5 px-4 py-3 text-left text-xs font-bold text-slate-500 uppercase tracking-[0.12em]">
                    {definition?.name || `Attribute ${entry.attributeId}`}
                  </th>
                  <td className="px-4 py-3 text-sm font-semibold text-slate-800">
                    {entry.value}
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      ) : (
        <p className="px-4 py-6 text-sm text-slate-500">
          No technical specifications available.
        </p>
      )}
    </section>
  );
}

export default memo(SpecificationTable);
