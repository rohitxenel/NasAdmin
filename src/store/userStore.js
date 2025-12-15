import { create } from "zustand";

export const useUserStore = create((set) => ({
  // Trip state
  users: [],
  setUsers: (data) => set({ users: data }),
  currentPage: 1,
  setCurrentPage: (page) => set({ currentPage: page }),
  totalPages: 1,
  setTotalPages: (pages) => set({ totalPages: pages }),

  // Post Job state
  postJobs: [],
  setPostJobs: (data) => set({ postJobs: data }),
  postJobPage: 1,
  setPostJobPage: (page) => set({ postJobPage: page }),
  postJobTotalPages: 1,
  setPostJobTotalPages: (pages) => set({ postJobTotalPages: pages }),
}));
