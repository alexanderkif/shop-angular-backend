'use strict';

module.exports.basicAuthorizer = async (event) => {
  console.log('basicAuthorizer event:', event);

  let password = '';

  try {
    password = Buffer.from(event.headers.authorization.split(' ')[1], 'base64').toString('ascii');
  } catch (error) {
    console.log(error);
    return {errorMessage: "Unauthorized"};
  }

  const response = {
    isAuthorized: password === process.env.alexanderkif
  }
  console.log('response', response);

  return response;
};
