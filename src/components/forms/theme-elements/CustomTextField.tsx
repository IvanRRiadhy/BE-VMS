'use client';

import { styled } from '@mui/material/styles';
import { TextField } from '@mui/material';

const CustomTextField = styled((props: any) => <TextField {...props} />)(({ theme }) => ({
  '& .MuiOutlinedInput-input::-webkit-input-placeholder': {
    color: theme.palette.text.secondary,
    opacity: '0.8',
  },
  '& .MuiOutlinedInput-input.Mui-disabled::-webkit-input-placeholder': {
    color: theme.palette.text.secondary,
    opacity: '1',
  },
  '& .Mui-disabled .MuiOutlinedInput-notchedOutline': {
    borderColor: theme.palette.grey[200],
  },
  '& .MuiInputBase-root.Mui-disabled': {
    backgroundColor: '#f0f0f0', // ubah jadi abu-abu terang
  },
  '& .MuiInputBase-input.Mui-disabled': {
    WebkitTextFillColor: '#666', // warna teks agar lebih gelap
  },
}));

export default CustomTextField;
