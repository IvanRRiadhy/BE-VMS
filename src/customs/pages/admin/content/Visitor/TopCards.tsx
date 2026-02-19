import React, { useState } from 'react';
import {
  CardContent,
  Typography,
  Grid2 as Grid,
  Avatar,
  Box,
  Stack,
  Dialog,
  DialogTitle,
  DialogContent,
  IconButton,
} from '@mui/material';
import CloseIcon from '@mui/icons-material/Close';

import icon7 from '../../../../../assets/images/svgs/all-visitors.svg';
import icon10 from '../../../../../assets/images/svgs/scan-qr.svg';
import icon11 from '../../../../../assets/images/svgs/add-btn.svg';
import BlankCard from 'src/components/shared/BlankCard';
import FormWizardAddVisitor from './Trx/FormWizardAddVisitor';
import FormWizardAddInvitation from './Trx/FormWizardAddInvitation';

interface CardItems {
  title: string;
  subTitle: string;
  icon: string;
}

const CardItems: CardItems[] = [
  {
    title: 'Total Visitor',
    subTitle: '739',
    icon: icon7,
  },
  {
    title: 'Scan QR Visitor',
    subTitle: 'scan QR',
    icon: icon10,
  },
  {
    title: 'Visitor',
    subTitle: 'Add Visitor',
    icon: icon11,
  },
  {
    title: 'Pra Registration',
    subTitle: 'Add Invitation',
    icon: icon11,
  },
];

const TopCards = () => {
  const [openFormWizardAddVisitor, setOpenFormWizardAddVisitor] = useState(false);
  const [openFormWizardAddInvitation, setOpenFormWizardAddInvitation] = useState(false);

  const handleClickOpenDialog = (index: number) => {
    if (index === 2) {
      setOpenFormWizardAddVisitor(true);
    } else if (index === 3) {
      setOpenFormWizardAddInvitation(true);
    }
  };

  const handleCloseModalAddVisitor = () => setOpenFormWizardAddVisitor(false);
  const handleCloseModalAddInvitation = () => setOpenFormWizardAddInvitation(false);

  return (
    <>
      <Grid container spacing={3}>
        {CardItems.map((card, index) => (
          <Grid
            key={index}
            size={{
              xs: 12,
              sm: 3,
            }}
          >
            <BlankCard>
              <CardContent>
                <Stack
                  direction="row"
                  spacing={2}
                  alignItems="center"
                  justifyContent="space-between"
                >
                  <Stack direction="row" spacing={2}>
                    <Avatar
                      src={card.icon}
                      alt={card.title}
                      onClick={() => handleClickOpenDialog(index)}
                      sx={{ cursor: 'pointer' }}
                    />
                    <Box>
                      <Typography variant="h6">{card.title}</Typography>
                      <Typography
                        variant="subtitle1"
                        color="textSecondary"
                        display="flex"
                        alignItems="center"
                        gap="3px"
                      >
                        {card.subTitle}
                      </Typography>
                    </Box>
                  </Stack>
                </Stack>
              </CardContent>
            </BlankCard>
          </Grid>
        ))}
      </Grid>

      {/* Dialog Add Visitor */}
      <Dialog
        open={openFormWizardAddVisitor}
        onClose={handleCloseModalAddVisitor}
        fullWidth
        maxWidth="md"
      >
        <DialogTitle>
          Add Visitor
          <IconButton
            aria-label="close"
            onClick={handleCloseModalAddVisitor}
            sx={{ position: 'absolute', right: 8, top: 8 }}
          >
            <CloseIcon />
          </IconButton>
        </DialogTitle>
        <DialogContent>
          <br />
          {/* <FormWizardAddVisitor /> */}
        </DialogContent>
      </Dialog>

      {/* Dialog Add Invitation */}
      <Dialog
        open={openFormWizardAddInvitation}
        onClose={handleCloseModalAddInvitation}
        fullWidth
        maxWidth="md"
      >
        <DialogTitle>
          Add Invitation
          <IconButton
            aria-label="close"
            onClick={handleCloseModalAddInvitation}
            sx={{ position: 'absolute', right: 8, top: 8 }}
          >
            <CloseIcon />
          </IconButton>
        </DialogTitle>
        <DialogContent>
          <br />
          {/* <FormWizardAddInvitation /> */}
        </DialogContent>
      </Dialog>
    </>
  );
};

export default TopCards;
