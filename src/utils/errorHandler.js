
// 📁 src/errorHandler.js

function handleError(error, fallbackAction = null) {
    console.error('❌ Error:', error.message);
    if (fallbackAction) {
        try {
            fallbackAction();
        } catch (fallbackError) {
            console.error('❌ Fallback failed:', fallbackError.message);
        }
    }
}

module.exports = { handleError };

