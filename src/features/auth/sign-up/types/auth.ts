export type SignUpFormData = {
    username: string;
    email: string;
    password: string;
    passwordConfirm: string;
    agreement: boolean;
}

export type SignInFormData = {
    email: string;
    password: string;
    rememberMe?: boolean;
}

export type ApiResponse<T = any> = {
    success: boolean;
    message: string;
    field?: string;
    data?: T;
}


export interface User {
    id: string;
    username: string;
    email: string;
    emailVerified: boolean;
    createdAt: Date;
    updatedAt: Date;
}

export interface AuthState {
    user: User | null;
    isLoading: boolean;
    isAuthenticated: boolean;
}