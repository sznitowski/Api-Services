function formatUserForView(dbUser) {
  const formattedUser = {
    id: dbUser._id.toString(),
    service: dbUser.service,
    name: dbUser.name,
    password: dbUser.password,
    passwordConfirm: dbUser.passwordConfirm,
    description: dbUser.description,
    contact: dbUser.contact,
    location: dbUser.location,
  };

  return formattedUser;
}

function formatUserListForView(dbUserList) {
  const formattedList = dbUserList.map((dbUser) => {
    return formatUserForView(dbUser);
  });

  return formattedList;
}

function isValidUserData(data) {
  if (!data.service) return false;
  if (!data.name) return false;
  if (!data.password) return false;
  if (!data.passwordConfirm) return false;
  if (!data.description) return false;
  if (!data.contact) return false;
  if (!data.location) return false;
//  if (!data.coverUrl) return false;

  // No errors
  return true;
}

module.exports = {
  formatUserForView,
  formatUserListForView,
  isValidUserData,
};