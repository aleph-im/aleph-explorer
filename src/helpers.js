import axios from 'axios'

export const toUnixTimestamp = d => d ? new Date(d).getTime() / 1000 : undefined


/**
 * Fetch addresses with pagination, sorting and filtering
 * Only uses v1 API endpoint
 *
 * @param {Object} api_server The API server configuration
 * @param {Object} options Query parameters
 * @returns {Promise<Object>} The API response
 */
export const fetchAddresses = async (api_server, options = {}) => {
  const {
    page = 1,
    perPage = 20,
    sortBy = 'total',
    sortOrder = -1,
    addressContains = ''
  } = options;

  const apiSortBy = sortBy || 'total';

  try {
    const response = await axios.get(
      `${api_server.protocol}//${api_server.host}/api/v1/addresses/stats.json`,
      {
        params: {
          pagination: perPage,
          page,
          sortBy: apiSortBy,
          sortOrder,
          ...(addressContains ? { addressContains } : {})
        }
      }
    );
    const addressList = [];
    const addressesObject = {};

    // Loop through the response data
    Object.entries(response.data.data).forEach(([address, stats]) => {
      const addressData = {
        address: address,
        messages: stats.messages || 0,
        post: stats.post || 0,
        aggregate: stats.aggregate || 0,
        store: stats.store || 0,
        program: stats.program || 0,
        instance: stats.instance || 0,
        forget: stats.forget || 0
      };

      // Add to list and object
      addressList.push(addressData);
      addressesObject[address] = addressData;
    });

    return {
      addresses: addressList,
      addressesObject,
      pagination: {
        page: response.data.pagination_page,
        per_page: response.data.pagination_per_page,
        total: response.data.pagination_total
      }
    };
  } catch (error) {
    console.error('Failed to fetch addresses:', error);
    if (error.response?.data) {
      console.error('API error details:', error.response.data);
    }
    throw error;
  }
}
