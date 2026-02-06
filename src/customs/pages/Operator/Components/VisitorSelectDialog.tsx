import { Dialog, DialogTitle, DialogContent, IconButton } from '@mui/material';
import { IconX } from '@tabler/icons-react';
import VisitorSelect from 'src/customs/components/select2/VisitorSelect';


type Props = {
  open: boolean;
  isEmployeeMode: boolean;
  token: string;

  activeGroupIdx: number | null;
  activeStep: number;

  setOpen: (v: boolean) => void;
  setActiveGroupIdx: (v: number | null) => void;
  setDataVisitor: React.Dispatch<React.SetStateAction<any[]>>;
};

const VisitorSelectDialog: React.FC<Props> = ({
  open,
  isEmployeeMode,
  token,
  activeGroupIdx,
  activeStep,
  setOpen,
  setActiveGroupIdx,
  setDataVisitor,
}) => {
  return (
    <Dialog open={open} onClose={() => setOpen(false)} fullWidth maxWidth="sm">
      <DialogTitle>
        {isEmployeeMode ? 'Select Employee' : 'Select Visitor'}

        <IconButton onClick={() => setOpen(false)} sx={{ position: 'absolute', right: 8, top: 8 }}>
          <IconX />
        </IconButton>
      </DialogTitle>

      <DialogContent dividers>
        <VisitorSelect
          token={token}
          isEmployee={isEmployeeMode}
          onSelect={(v: any) => {
            if (activeGroupIdx == null) return;

            // kalau clear
            if (!v) {
              setOpen(false);
              setActiveGroupIdx(null);
              return;
            }

            let genderValue = '2';
            if (v.gender === 'Male') genderValue = '1';
            else if (v.gender === 'Female') genderValue = '0';

            const mapping: Record<string, string> = {
              name: v.name,
              email: v.email,
              phone: v.phone,
              organization: isEmployeeMode ? v?.organization?.name : v.organization,
              indentity_id: v.identity_id,
              gender: genderValue,
              employee: isEmployeeMode ? v.id : '',
            };

            setDataVisitor((prev) => {
              const next = [...prev];
              const s = activeStep - 1;

              if (!next[activeGroupIdx]?.question_page?.[s]?.form) {
                return prev;
              }

              next[activeGroupIdx].question_page[s].form = next[activeGroupIdx].question_page[
                s
              ].form.map((item: any) =>
                mapping[item.remarks] !== undefined
                  ? { ...item, answer_text: mapping[item.remarks] }
                  : item,
              );

              return next;
            });

            setOpen(false);
            setActiveGroupIdx(null);
          }}
        />
      </DialogContent>
    </Dialog>
  );
};

export default VisitorSelectDialog;
