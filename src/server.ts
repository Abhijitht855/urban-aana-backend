import 'dotenv/config';
import app from './app';
import connectDB from './config/db';
import { startOrderScheduler } from './utils/orderScheduler'; // 🔥 ഇത് ഇമ്പോർട്ട് ചെയ്യുക

const PORT = process.env.PORT || 5000;

connectDB().then(() => {
  app.listen(PORT, () => {
    console.log(`🚀 Server running on http://localhost:${PORT}`);
    
    // 🔥 സർവർ സ്റ്റാർട്ട് ചെയ്യുമ്പോൾ ഓട്ടോമാറ്റിക് ട്രാക്കിംഗ് അപ്‌ഡേറ്റർ ഓൺ ചെയ്യുന്നു
    startOrderScheduler();
  });
}).catch((err) => {
  console.error('❌ Failed to connect:', err);
  process.exit(1);
});

// സെർവർ എറർ ഹാൻഡ്‌ലിംഗ്
process.on('unhandledRejection', (err) => {
  console.error('Unhandled Rejection:', err);
  process.exit(1);
});

process.on('uncaughtException', (err) => {
  console.error('Uncaught Exception:', err);
  process.exit(1);
});