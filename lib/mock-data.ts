// Mock data to replace Supabase
export interface Project {
  id: string
  name: string
  description: string | null
  owner_id: string
  created_at: string
  updated_at: string
}

export interface TestSuite {
  id: string
  name: string
  description: string | null
  project_id: string
  created_at: string
  updated_at: string
}

export interface TestRun {
  id: string
  name: string
  status: "pending" | "running" | "completed" | "failed"
  suite_id: string
  started_at: string | null
  completed_at: string | null
  created_at: string
  updated_at: string
}

export interface TestStep {
  id: string
  name: string
  description: string | null
  step_type: "video" | "image" | "text"
  media_url: string | null
  run_id: string
  step_order: number
  created_at: string
  updated_at: string
}

export interface Profile {
  id: string
  email: string
  full_name: string | null
  avatar_url: string | null
  created_at: string
  updated_at: string
}

// Mock data
export const mockProjects: Project[] = [
  {
    id: "1",
    name: "Mobile Banking App",
    description: "Comprehensive testing suite for our mobile banking application",
    owner_id: "dummy-user-id",
    created_at: "2025-01-01T00:00:00Z",
    updated_at: "2025-01-01T00:00:00Z",
  },
  {
    id: "2",
    name: "E-commerce Platform",
    description: "Testing flows for checkout, payments, and user management",
    owner_id: "dummy-user-id",
    created_at: "2025-01-02T00:00:00Z",
    updated_at: "2025-01-02T00:00:00Z",
  },
]

export const mockTestRuns: TestRun[] = [
  {
    id: "1",
    name: "Login Test Run #1",
    status: "completed",
    suite_id: "1",
    started_at: "2025-01-01T10:00:00Z",
    completed_at: "2025-01-01T10:30:00Z",
    created_at: "2025-01-01T09:00:00Z",
    updated_at: "2025-01-01T10:30:00Z",
  },
  {
    id: "2",
    name: "Payment Test Run #1",
    status: "running",
    suite_id: "2",
    started_at: "2025-01-01T11:00:00Z",
    completed_at: null,
    created_at: "2025-01-01T10:00:00Z",
    updated_at: "2025-01-01T11:00:00Z",
  },
]

// Mock API functions
export const mockApi = {
  getProjects: async () => ({ data: mockProjects, error: null }),
  getTestRuns: async () => ({ data: mockTestRuns, error: null }),
  getStats: async () => ({
    data: {
      totalProjects: 2,
      totalRuns: 5,
      completedRuns: 3,
      runningRuns: 1,
    },
    error: null,
  }),
}
