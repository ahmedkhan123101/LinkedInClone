import { createSlice, createAsyncThunk } from "@reduxjs/toolkit"

import axiosInstance from "../../api/axiosInstance.js"

export const fetchCurrentUser = createAsyncThunk(
    "auth/fetchCurrentUser",

    async (_, { rejectWithValue }) => {
        try {
            const response = await axiosInstance.get("/auth/me")
            return response.data
        } catch (error) {
            return rejectWithValue(
                error.response?.data?.message || "Failed to fetch user."
            )
        }
    }
)

const authSlice = createSlice({
    name: "auth",

    initialState: {
        user: null,
        accessToken: null,
        isAuthenticated: false,
        loading: false
    },

    reducers: {
        setAuth: (state, action) => {
            state.user = action.payload.user
            state.accessToken = action.payload.accessToken
            state.isAuthenticated = true
        },

        logout: (state) => {
            state.user = null
            state.accessToken = null
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

            .addCase(fetchCurrentUser.rejected, (state) => {
                state.loading = false
                state.isAuthenticated = false
                state.user = null
            })
    }
})

export const { setAuth, logout } = authSlice.actions

export default authSlice.reducer