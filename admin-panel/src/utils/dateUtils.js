import moment from 'moment-timezone';

/**
 * Formats a date string using moment-timezone
 * @param {string|Date} date - The date to format
 * @param {string} format - The moment format string (default: 'YYYY-MM-DD HH:mm:ss')
 * @returns {string} Formatted date string
 */
export const formatDateTime = (date, format = 'DD MMM YYYY, hh:mm A') => {
    if (!date) return 'N/A';
    // Use the browser's timezone or a specific one if needed
    const tz = moment.tz.guess();
    return moment(date).tz(tz).format(format);
};

/**
 * Returns a human-readable "time ago" string
 * @param {string|Date} date 
 * @returns {string}
 */
export const timeAgo = (date) => {
    if (!date) return 'N/A';
    const tz = moment.tz.guess();
    return moment(date).tz(tz).fromNow();
};

export default {
    formatDateTime,
    timeAgo
};
