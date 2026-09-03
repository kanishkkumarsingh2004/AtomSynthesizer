import React from 'react';

interface SubscriptFormulaProps {
  formula: string;
  className?: string;
  subClassName?: string;
}

/**
 * Parses chemical formulas like "C8H10N4O2" and renders numbers as subscript <sub> elements.
 */
export const SubscriptFormula: React.FC<SubscriptFormulaProps> = ({
  formula,
  className = '',
  subClassName = 'text-[0.75em] align-sub font-bold'
}) => {
  if (!formula) return <span className={className}>Empty</span>;

  // Match letters/symbols vs numbers
  const tokens = formula.match(/([A-Za-z]+|\d+|\^[-+]?\d*|[-+])/g) || [formula];

  return (
    <span className={className}>
      {tokens.map((token, i) => {
        if (/^\d+$/.test(token)) {
          return (
            <sub key={i} className={subClassName}>
              {token}
            </sub>
          );
        }
        if (token.startsWith('^')) {
          return (
            <sup key={i} className="text-[0.75em] align-super font-bold">
              {token.slice(1)}
            </sup>
          );
        }
        return <span key={i}>{token}</span>;
      })}
    </span>
  );
};
