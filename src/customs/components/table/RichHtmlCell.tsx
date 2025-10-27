// components/RichHtmlCell.tsx
import * as React from 'react';
import { Box } from '@mui/material';
import normalizeQuillHtml from 'src/utils/normalizeQuillHtml';
import sanitizeHtml from 'src/utils/sanitizeHtml';

type Props = {
  html: string | null | undefined;
  lines?: number;
  maxWidth?: number | string;
};

export const RichHtmlCell: React.FC<Props> = ({ html, lines = 3, maxWidth = 520 }) => {
  const safeHtml = React.useMemo(() => {
    const normalized = normalizeQuillHtml(html ?? '');
    return sanitizeHtml(normalized);
  }, [html]);

  return (
    <Box
      sx={{
        maxWidth,
        overflow: 'hidden',
        display: '-webkit-box',
        WebkitLineClamp: lines,
        WebkitBoxOrient: 'vertical',
        textOverflow: 'ellipsis',
        wordBreak: 'break-word',
        fontSize: '0.7rem',
        '& *': { marginBlockStart: 0, marginBlockEnd: 0 },
      }}
      dangerouslySetInnerHTML={{ __html: safeHtml }}
    />
  );
};
export default RichHtmlCell;
