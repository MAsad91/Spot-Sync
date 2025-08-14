export const saveSession = (data) => {
  localStorage.setItem("Authorization", data.token);
  localStorage.setItem("email", data.email);
};

export const getSession = () => {
  return {
    Authorization: localStorage.getItem("Authorization"),
    email: localStorage.getItem("email"),
  };
};

export const clearSession = () => {
  localStorage.removeItem("Authorization");
  localStorage.removeItem("email");
  localStorage.removeItem("placeId");
};

export const saveCustomerSession = (data) => {
  localStorage.setItem("CustomerAuthorization", data.token);
};

export const getCustomerSession = () => {
  return {
    CustomerAuthorization: localStorage.getItem("CustomerAuthorization"),
  };
};

export const clearCustomerSession = () => {
  localStorage.removeItem("CustomerAuthorization");
};

export const generateNumbers = (start, end) => {
  const sequence = [];
  for (let i = start; i <= end; i++) {
    sequence.push({ label: i.toString() });
  }
  return sequence;
};
