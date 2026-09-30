import { createSlice, createAsyncThunk } from "@reduxjs/toolkit"

import axiosInstance from "../../api/axiosInstance.js"

export const fetchCurrentUser = createAsyncThunk(
    "auth/fetchCurrentUser",

    async (_, { rejectWithValue }) => {
        try {
            const response = await axiosInstance.get("/auth/me")
            return response.data
        } catch (error) {
            if (!error.response) {
                return rejectWithValue("Network Error")
            }
            return rejectWithValue(error.response?.data?.message || "Failed to fetch user.")
        }
    }
)

const authSlice = createSlice({
    name: "auth",

    initialState: {
        user: null,
        isAuthenticated: false,
        loading: true
    },

    reducers: {
        setAuth: (state, action) => {
            state.user = action.payload.user
            state.isAuthenticated = true
        },
        updateUser: (state, action) => {
            state.user = action.payload;
        },
        logout: (state) => {
            state.user = null
            state.isAuthenticated = false
        }
    },

    extraReducers: (builder) => {
        builder
            .addCase(fetchCurrentUser.pending, (state) => {
                state.loading = true
            })

            .addCase(fetchCurrentUser.fulfilled, (state, action) => {
                state.loading = false
                state.isAuthenticated = true
                state.user = action.payload
            })

            .addCase(fetchCurrentUser.rejected, (state, action) => {
                state.loading = false
                if (action.payload !== "Network Error") {
                    state.isAuthenticated = false
                    state.user = null
                }
            })
    }
})

export const { setAuth, updateUser, logout } = authSlice.actions

export default authSlice.reducer