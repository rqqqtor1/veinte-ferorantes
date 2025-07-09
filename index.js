import app from "./app.js";
import "./database.js";

async function main() {
  try {
    const port = process.env.PORT || 4000;
    
    const server = app.listen(port, () => {
      console.log(' Server Information:');
      console.log(`   Port: ${port}`);
      console.log(`   Environment: ${process.env.NODE_ENV || 'development'}`);
      console.log(`   URL: http://localhost:${port}`);
      console.log(' Documentation: http://localhost:' + port + '/api-docs');
      console.log(' Health Check: http://localhost:' + port + '/health');
      console.log(' Server is ready to accept connections');
    });

    // Graceful shutdown
    const gracefulShutdown = (signal) => {
      console.log(`\n🔄 Received ${signal}. Starting graceful shutdown...`);
      
      server.close(() => {
        console.log(' HTTP server closed');
        process.exit(0);
      });

      // Force close server after 10 seconds
      setTimeout(() => {
        console.error(' Could not close connections in time, forcefully shutting down');
        process.exit(1);
      }, 10000);
    };

    // Listen for termination signals
    process.on('SIGTERM', () => gracefulShutdown('SIGTERM'));
    process.on('SIGINT', () => gracefulShutdown('SIGINT'));

    // Handle unhandled promise rejections
    process.on('unhandledRejection', (err, promise) => {
      console.error('❌ Unhandled Promise Rejection:', err.message);
      console.error('Stack:', err.stack);
      
      // Close server & exit process
      server.close(() => {
        process.exit(1);
      });
    });

    // Handle uncaught exceptions
    process.on('uncaughtException', (err) => {
      console.error(' Uncaught Exception:', err.message);
      console.error('Stack:', err.stack);
      process.exit(1);
    });

  } catch (error) {
    console.error(' Failed to start server:', error.message);
    process.exit(1);
  }
}

main();