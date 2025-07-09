const supabase = require("../supabase/client");

// // Register a new user
// const register = async (req, res) => {
//   try {
//     const { email, password, full_name, phone } = req.body;
//     console.log("Registration attempt:", { email, full_name });

//     if (!email || !password) {
//       return res.status(400).json({ error: "Email and password are required" });
//     }

//     // Clean email
//     const cleanEmail = email.toLowerCase().trim();

//     // Create user in Supabase Auth
//     const { data: authData, error: authError } = await supabase.auth.signUp({
//       email: cleanEmail,
//       password,
//       options: {
//         data: {
//           full_name: full_name || cleanEmail,
//         },
//       },
//     });

//     if (authError) {
//       console.error("Supabase auth error:", authError);
//       return res.status(400).json({ error: authError.message });
//     }

//     console.log("Supabase auth successful:", authData.user?.id);

//     // Create user profile in our users table
//     const { data: userData, error: userError } = await supabase
//       .from("users")
//       .insert({
//         id: authData.user.id,
//         email: authData.user.email,
//         full_name: full_name || authData.user.email,
//         phone: phone || null,
//         role: "user",
//       })
//       .select()
//       .single();

//     if (userError) {
//       console.error("User profile creation error:", userError);
//       return res.status(500).json({ error: "Failed to create user profile" });
//     }

//     console.log("User profile created successfully:", userData.id);

//     res.status(201).json({
//       message: "User registered successfully",
//       user: {
//         id: userData.id,
//         email: userData.email,
//         full_name: userData.full_name,
//         role: userData.role,
//       },
//     });
//   } catch (error) {
//     console.error("Registration error:", error);
//     res.status(500).json({ error: "Registration failed" });
//   }
// };
// Register a new user

const register = async (req, res) => {
  try {
    const { email, password, full_name, phone } = req.body;
    console.log("Registration attempt:", { email, full_name });

    if (!email || !password) {
      return res.status(400).json({ error: "Email and password are required" });
    }

    const cleanEmail = email.toLowerCase().trim();

    // Step 1: Create user in Supabase Auth
    const { data: authData, error: authError } = await supabase.auth.signUp({
      email: cleanEmail,
      password,
      options: {
        data: {
          full_name: full_name || cleanEmail,
        },
      },
    });

    if (authError) {
      console.error("Supabase auth error:", authError);
      return res.status(400).json({ error: authError.message });
    }

    const userId = authData.user?.id;
    if (!userId) {
      return res.status(500).json({ error: "Failed to get user ID" });
    }

    // Step 2: Insert into your custom 'users' table
    const { data: userData, error: userError } = await supabase
      .from("users")
      .insert({
        id: userId,
        email: cleanEmail,
        full_name: full_name || cleanEmail,
        phone: phone || null,
        role: "user",
      })
      .select()
      .single();

    if (userError) {
      console.error("User profile creation error:", userError);
      return res.status(500).json({ error: "Failed to create user profile" });
    }

    // Step 3: Immediately log in the user to get access token
    const { data: loginData, error: loginError } =
      await supabase.auth.signInWithPassword({
        email: cleanEmail,
        password,
      });

    if (loginError) {
      console.error("Login after register failed:", loginError);
      return res.status(500).json({ error: "Auto-login after registration failed" });
    }

    return res.status(201).json({
      message: "User registered and logged in successfully",
      user: {
        id: userData.id,
        email: userData.email,
        full_name: userData.full_name,
        phone: userData.phone,
        role: userData.role,
        created_at: userData.created_at,
      },
      session: {
        access_token: loginData.session.access_token,
        refresh_token: loginData.session.refresh_token,
        expires_at: loginData.session.expires_at,
      },
    });
  } catch (error) {
    console.error("Registration error:", error);
    res.status(500).json({ error: "Registration failed" });
  }
};

// Login user
const login = async (req, res) => {
  try {
    const { email, password } = req.body;
    console.log("Login attempt:", { email });

    if (!email || !password) {
      return res.status(400).json({ error: "Email and password are required" });
    }

    // Authenticate with Supabase
    const { data: authData, error: authError } =
      await supabase.auth.signInWithPassword({
        email: email.toLowerCase().trim(),
        password,
      });

    console.log("Auth result:", { success: !authError, userId: authData?.user?.id });

    if (authError) {
      console.error("Login error:", authError);
      return res.status(401).json({ error: "Invalid credentials" });
    }

    // Get user profile
    const { data: userData, error: userError } = await supabase
      .from("users")
      .select("*")
      .eq("id", authData.user.id)
      .single();

    console.log("User profile result:", { success: !userError, userData });

    if (userError) {
      console.error("User profile error:", userError);
      return res.status(500).json({ error: "Failed to get user profile" });
    }

    res.json({
      message: "Login successful",
      user: {
        id: userData.id,
        email: userData.email,
        full_name: userData.full_name,
        phone: userData.phone,
        role: userData.role,
        created_at: userData.created_at,
      },
      session: {
        access_token: authData.session.access_token,
        refresh_token: authData.session.refresh_token,
        expires_at: authData.session.expires_at,
      },
    });
  } catch (error) {
    console.error("Login error:", error);
    res.status(500).json({ error: "Login failed" });
  }
};

// Get user profile
const getProfile = async (req, res) => {
  try {
    const userId = req.user.id;

    const { data: userData, error: userError } = await supabase
      .from("users")
      .select(
        `
        *,
        profiles (*)
      `
      )
      .eq("id", userId)
      .single();

    if (userError) {
      return res.status(404).json({ error: "User profile not found" });
    }

    res.json({
      user: {
        id: userData.id,
        email: userData.email,
        full_name: userData.full_name,
        phone: userData.phone,
        role: userData.role,
        created_at: userData.created_at,
        profile: userData.profiles,
      },
    });
  } catch (error) {
    console.error("Get profile error:", error);
    res.status(500).json({ error: "Failed to get profile" });
  }
};

// Update user profile
const updateProfile = async (req, res) => {
  try {
    const userId = req.user.id;
    const { full_name, phone, address, preferences } = req.body;

    // Update user table
    const { data: userData, error: userError } = await supabase
      .from("users")
      .update({
        full_name: full_name || req.user.full_name,
        phone: phone || req.user.phone,
        updated_at: new Date(),
      })
      .eq("id", userId)
      .select()
      .single();

    if (userError) {
      return res.status(500).json({ error: "Failed to update user profile" });
    }

    // Update or create profile
    const { data: profileData, error: profileError } = await supabase
      .from("profiles")
      .upsert({
        id: userId,
        address: address,
        preferences: preferences || {},
      })
      .select()
      .single();

    if (profileError) {
      console.error("Profile update error:", profileError);
    }

    res.json({
      message: "Profile updated successfully",
      user: {
        id: userData.id,
        email: userData.email,
        full_name: userData.full_name,
        phone: userData.phone,
        role: userData.role,
        profile: profileData,
      },
    });
  } catch (error) {
    console.error("Update profile error:", error);
    res.status(500).json({ error: "Failed to update profile" });
  }
};

// Get user bookings
const getUserBookings = async (req, res) => {
  try {
    const userId = req.user.id;

    const { data: bookings, error } = await supabase
      .from("bookings")
      .select(
        `
        *,
        flights (
          id,
          flight_number,
          airline,
          origin,
          destination,
          departure_time,
          arrival_time,
          price
        )
      `
      )
      .eq("user_id", userId)
      .order("created_at", { ascending: false });

    if (error) {
      return res.status(500).json({ error: "Failed to fetch bookings" });
    }

    res.json({
      bookings: bookings || [],
    });
  } catch (error) {
    console.error("Get user bookings error:", error);
    res.status(500).json({ error: "Failed to get bookings" });
  }
};

module.exports = {
  register,
  login,
  getProfile,
  updateProfile,
  getUserBookings,
};
