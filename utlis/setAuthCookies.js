const setAuthCookies = (res, accessToken, refreshToken) => {
  const options = {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "Lax",
    path: "/",
  };

  res.cookie("accessToken", accessToken, {
    ...options,
    maxAge: 2 * 60 * 60 * 1000, // 2 hours
  });

  res.cookie("refreshToken", refreshToken, {
    ...options,
    maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days
  });
};

export default setAuthCookies;
