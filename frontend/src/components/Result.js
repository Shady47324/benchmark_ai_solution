import React from 'react';
import ReactMarkdown from 'react-markdown';
import { Prism as SyntaxHighlighter } from 'react-syntax-highlighter';
import { oneDark } from 'react-syntax-highlighter/dist/esm/styles/prism';

function Result({ resultData }) {
  if (!resultData) return null;

  const {
    originalWithHighlights,
    correctedWithHighlights,
    output,
    errors,
    corrections,
  } = resultData;

  return (
    <div className="mt-10 space-y-8 px-4 md:px-8">
      {/* Code original avec fautes surlignées */}
      {originalWithHighlights && (
        <div>
          <h3 className="text-red-600 font-semibold mb-2">Code original avec erreurs</h3>
          <div
            className="rounded-2xl overflow-hidden shadow-lg max-h-[40vh]"
            dangerouslySetInnerHTML={{ __html: originalWithHighlights }}
          />
        </div>
      )}

      {/* Code corrigé avec surlignage vert */}
      {correctedWithHighlights && (
        <div>
          <h3 className="text-green-600 font-semibold mb-2">Code corrigé</h3>
          <div
            className="rounded-2xl overflow-hidden shadow-lg max-h-[40vh]"
            dangerouslySetInnerHTML={{ __html: correctedWithHighlights }}
          />
        </div>
      )}

      {/* Affichage du résultat brut en markdown (optionnel) */}
      {output && (
        <div className="bg-white dark:bg-gray-900 rounded-2xl p-6 shadow-lg border border-gray-300 dark:border-gray-700">
          <ReactMarkdown
            children={output}
            components={{
              code({ node, inline, className, children, ...props }) {
                const match = /language-(\w+)/.exec(className || '');
                return !inline && match ? (
                  <SyntaxHighlighter
                    style={oneDark}
                    language={match[1]}
                    PreTag="div"
                    {...props}
                    className="rounded-lg"
                  >
                    {String(children).replace(/\n$/, '')}
                  </SyntaxHighlighter>
                ) : (
                  <code className="bg-gray-200 dark:bg-gray-800 rounded px-1 py-0.5" {...props}>
                    {children}
                  </code>
                );
              },
            }}
          />
        </div>
      )}

      {/* Erreurs détectées */}
      {errors && errors.length > 0 && (
        <div className="bg-red-50 border-l-4 border-red-500 text-red-800 p-5 rounded-xl shadow flex gap-3 items-start dark:bg-red-900/30 dark:text-red-400">
          <span className="text-xl">❌</span>
          <div>
            <strong className="text-red-700 dark:text-red-300">Erreurs détectées :</strong>
            <pre className="whitespace-pre-wrap mt-2 text-sm">{typeof errors === 'string' ? errors : errors.join('\n')}</pre>
          </div>
        </div>
      )}

      {/* Suggestions de correction */}
      {corrections && corrections.length > 0 && (
        <div className="bg-yellow-50 border-l-4 border-yellow-500 text-yellow-800 p-5 rounded-xl shadow flex gap-3 items-start dark:bg-yellow-900/30 dark:text-yellow-400">
          <span className="text-xl">💡</span>
          <div>
            <strong className="text-yellow-700 dark:text-yellow-300">Suggestions de correction :</strong>
            <pre className="whitespace-pre-wrap mt-2 text-sm">{typeof corrections === 'string' ? corrections : corrections.join('\n')}</pre>
          </div>
        </div>
      )}
    </div>
  );
}

export default Result;