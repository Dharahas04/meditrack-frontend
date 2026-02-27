import { render, screen } from '@testing-library/react';
import App from './App';

test('shows login screen', () => {
  render(<App />);
  expect(screen.getByText(/Hospital Management System/i)).toBeInTheDocument();
});
