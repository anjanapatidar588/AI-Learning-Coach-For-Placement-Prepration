import React from 'react';

const ConceptVisualizer = ({ diagram = {}, title = 'Concept Visual Diagram' }) => {
  if (!diagram || (!diagram.nodes && !diagram.content)) {
    return (
      <div className="bg-slate-900 border border-slate-800 rounded-xl p-6 text-center text-slate-400">
        No visual diagram available for this concept.
      </div>
    );
  }

  const nodes = Array.isArray(diagram.nodes) ? diagram.nodes : [];
  const edges = Array.isArray(diagram.edges) ? diagram.edges : [];
  const type = diagram.type || 'flow';

  return (
    <div className="bg-slate-900 border border-cyan-500/20 rounded-xl p-6 shadow-xl space-y-6">
      {/* Header */}
      <div className="pb-3 border-b border-slate-800 flex items-center justify-between">
        <div>
          <h4 className="text-lg font-bold text-white flex items-center gap-2">
            <span className="w-2.5 h-2.5 rounded-full bg-cyan-400"></span>
            {diagram.title || title}
          </h4>
          {diagram.content && (
            <p className="text-xs text-slate-400 mt-1">{diagram.content}</p>
          )}
        </div>
        <span className="px-2.5 py-1 text-[10px] font-mono font-bold uppercase rounded bg-cyan-500/10 text-cyan-300 border border-cyan-500/30">
          {type} DIAGRAM
        </span>
      </div>

      {/* Interactive Visual Graph Cards */}
      <div className="space-y-4">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {nodes.map((node, idx) => (
            <div
              key={node.id || idx}
              className="relative bg-slate-950/80 border border-slate-800 hover:border-cyan-500/50 rounded-xl p-4 transition-all duration-300 group"
            >
              <div className="flex items-center justify-between gap-2 mb-2">
                <span className="text-[10px] font-mono font-bold px-2 py-0.5 rounded bg-slate-800 text-slate-300">
                  Node {idx + 1}
                </span>
                {node.type && (
                  <span className="text-[10px] font-mono uppercase text-cyan-400">
                    {node.type}
                  </span>
                )}
              </div>
              <h5 className="font-bold text-slate-100 text-sm mb-1 group-hover:text-cyan-300 transition">
                {node.label}
              </h5>
              {node.details && (
                <p className="text-xs text-slate-400 leading-relaxed">{node.details}</p>
              )}
            </div>
          ))}
        </div>

        {/* Connections Legend */}
        {edges.length > 0 && (
          <div className="bg-slate-950 border border-slate-800/80 rounded-lg p-3 space-y-2">
            <h6 className="text-[10px] font-mono uppercase font-bold text-slate-400">Directed Flow Relations</h6>
            <div className="flex flex-wrap gap-2">
              {edges.map((edge, idx) => (
                <div key={idx} className="flex items-center gap-1.5 text-xs text-slate-300 bg-slate-900 border border-slate-800 px-2.5 py-1 rounded">
                  <span className="font-mono font-semibold text-cyan-300">{edge.from}</span>
                  <span className="text-slate-500">→</span>
                  <span className="text-[10px] text-emerald-400 font-mono">[{edge.label || 'next'}]</span>
                  <span className="text-slate-500">→</span>
                  <span className="font-mono font-semibold text-cyan-300">{edge.to}</span>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default ConceptVisualizer;
