import axios, { AxiosInstance, AxiosError } from "axios";

const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000";

class ApiClient {
  private client: AxiosInstance;

  constructor() {
    this.client = axios.create({
      baseURL: API_URL,
      headers: {
        "Content-Type": "application/json",
      },
    });

    // Add request interceptor to include token
    this.client.interceptors.request.use(
      (config) => {
        if (typeof window !== "undefined") {
          const token = localStorage.getItem("token");
          if (token) {
            config.headers.Authorization = `Bearer ${token}`;
          }
        }
        return config;
      },
      (error) => {
        return Promise.reject(error);
      }
    );

    // Add response interceptor to handle errors
    this.client.interceptors.response.use(
      (response) => response,
      (error: AxiosError) => {
        if (error.response?.status === 401) {
          // Unauthorized - clear token and redirect to login
          if (typeof window !== "undefined") {
            localStorage.removeItem("token");
            localStorage.removeItem("user");
            window.location.href = "/login";
          }
        }
        return Promise.reject(error);
      }
    );
  }

  // Auth endpoints
  async login(emailOrNrp: string, password: string) {
    const response = await this.client.post("/api/auth/login", {
      emailOrNrp,
      password,
    });
    return response.data;
  }

  async createAccount(data: {
    email: string;
    password: string;
    firstName: string;
    lastName: string;
    nrp: number;
    role?: string;
    posisi?: string;
    phoneNumber?: string;
    avatar?: string;
  }) {
    const response = await this.client.post("/api/auth/create-account", data);
    return response.data;
  }

  async bulkCreateUsers(users: Array<{
    email: string;
    password: string;
    firstName: string;
    lastName: string;
    nrp: number;
    role?: string;
    posisi?: string;
    phoneNumber?: string;
    avatar?: string;
  }>) {
    const response = await this.client.post("/api/superadmin/users/bulk-create", { users });
    return response.data;
  }

  async bulkDeleteUsers(userIds: string[]) {
    const response = await this.client.post("/api/superadmin/users/bulk-delete", { userIds });
    return response.data;
  }

  async updateProfile(data: { firstName?: string; lastName?: string; phoneNumber?: string }) {
    const response = await this.client.put("/api/auth/profile", data);
    return response.data;
  }

  async uploadProfilePicture(file: File) {
    const formData = new FormData();
    formData.append("profilePicture", file);
    
    const response = await this.client.post("/api/auth/profile/picture", formData, {
      headers: {
        "Content-Type": "multipart/form-data",
      },
    });
    return response.data;
  }

  async changePassword(oldPassword: string, newPassword: string) {
    const response = await this.client.put("/api/auth/change-password", {
      oldPassword,
      newPassword,
    });
    return response.data;
  }

  async getRoles() {
    const response = await this.client.get("/api/auth/roles");
    return response.data;
  }

  // Mechanics endpoints
  async createWorkTime(data: {
    startTime: string;
    endTime?: string;
    date: string;
  }) {
    const response = await this.client.post("/api/mechanics/work-times", data);
    return response.data;
  }

  async getWorkTimes() {
    const response = await this.client.get("/api/mechanics/work-times");
    return response.data;
  }

  async getWorkTimeById(id: string) {
    const response = await this.client.get(`/api/mechanics/work-times/${id}`);
    return response.data;
  }

  async updateWorkTime(
    id: string,
    data: {
      startTime?: string;
      endTime?: string;
      date?: string;
    }
  ) {
    const response = await this.client.put(
      `/api/mechanics/work-times/${id}`,
      data
    );
    return response.data;
  }

  async deleteWorkTime(id: string) {
    const response = await this.client.delete(
      `/api/mechanics/work-times/${id}`
    );
    return response.data;
  }

  async getMyActivities() {
    const response = await this.client.get("/api/mechanics/activities");
    return response.data;
  }

  async startActivity(activityId: string) {
    const response = await this.client.post(
      `/api/mechanics/activities/${activityId}/start`
    );
    return response.data;
  }

  async pauseActivity(activityId: string) {
    const response = await this.client.post(
      `/api/mechanics/activities/${activityId}/pause`
    );
    return response.data;
  }

  async resumeActivity(activityId: string) {
    const response = await this.client.post(
      `/api/mechanics/activities/${activityId}/resume`
    );
    return response.data;
  }

  async stopActivity(activityId: string) {
    const response = await this.client.post(
      `/api/mechanics/activities/${activityId}/stop`
    );
    return response.data;
  }

  async startTask(activityId: string, taskName: string) {
    const response = await this.client.post(
      `/api/mechanics/activities/${activityId}/tasks/start`,
      { taskName }
    );
    return response.data;
  }

  async stopTask(activityId: string, taskName: string) {
    const response = await this.client.post(
      `/api/mechanics/activities/${activityId}/tasks/stop`,
      { taskName }
    );
    return response.data;
  }

  // Planner endpoints
  async createActivity(data: {
    activityName: string;
    unitId: string;
    description?: string;
    remarks?: string;
    estimatedStart: string;
    activityStatus?: string;
  }) {
    const response = await this.client.post("/api/planner/activities", data);
    return response.data;
  }

  async getAllActivities() {
    const response = await this.client.get("/api/planner/activities");
    return response.data;
  }

  async getActivityById(id: string) {
    const response = await this.client.get(`/api/planner/activities/${id}`);
    return response.data;
  }

  async updateActivity(
    id: string,
    data: {
      unitId?: string;
      description?: string;
      remarks?: string;
      estimatedStart?: string;
      activityStatus?: string;
    }
  ) {
    const response = await this.client.put(
      `/api/planner/activities/${id}`,
      data
    );
    return response.data;
  }

  // Unit endpoints
  async getUnits(params?: {
    status?: string;
    type?: string;
    brand?: string;
    search?: string;
    page?: number;
    limit?: number;
    sortBy?: string;
    sortOrder?: string;
  }) {
    const response = await this.client.get("/api/units", { params });
    return response.data;
  }

  async getUnitById(id: string) {
    const response = await this.client.get(`/api/units/${id}`);
    return response.data;
  }

  async createUnit(data: {
    unitType: string;
    unitBrand: string;
    unitCode: string;
    unitDescription?: string;
    unitImage?: string;
    unitStatus?: string;
  }) {
    const response = await this.client.post("/api/units", data);
    return response.data;
  }

  async bulkCreateUnits(units: Array<{
    unitType: string;
    unitBrand: string;
    unitCode: string;
    unitDescription?: string;
    unitImage?: string;
    unitStatus?: string;
  }>) {
    const response = await this.client.post("/api/units/bulk-create", units);
    return response.data;
  }

  async updateUnit(
    id: string,
    data: {
      unitType?: string;
      unitBrand?: string;
      unitCode?: string;
      unitDescription?: string;
      unitImage?: string;
      unitStatus?: string;
    }
  ) {
    const response = await this.client.put(`/api/units/${id}`, data);
    return response.data;
  }

  async deleteUnit(id: string) {
    const response = await this.client.delete(`/api/units/${id}`);
    return response.data;
  }

  // Super Admin endpoints
  async getAllUsers(params?: {
    role?: string;
    posisi?: string;
    search?: string;
    page?: number;
    limit?: number;
    sortBy?: string;
    sortOrder?: string;
  }) {
    const response = await this.client.get("/api/superadmin/users", { params });
    return response.data;
  }

  async getMechanics() {
    // Get mechanics from planner endpoint (accessible by planners)
    const response = await this.client.get("/api/planner/mechanics");
    return response.data;
  }

  async getBreakdownUnitsReport() {
    const response = await this.client.get("/api/planner/unit-report/breakdown");
    return response.data;
  }

  async getMechanicsReport(params?: {
    search?: string;
  }) {
    const response = await this.client.get("/api/planner/mechanics-report", {
      params,
    });
    return response.data;
  }

  // Analytics endpoints
  async getActivityAnalytics() {
    const response = await this.client.get("/api/planner/analytics/activities");
    return response.data;
  }

  async getUnitAnalytics() {
    const response = await this.client.get("/api/planner/analytics/units");
    return response.data;
  }

  async getMechanicsAnalytics() {
    const response = await this.client.get("/api/planner/analytics/mechanics");
    return response.data;
  }

  async getUserById(id: string) {
    const response = await this.client.get(`/api/superadmin/users/${id}`);
    return response.data;
  }

  async updateUser(
    id: string,
    data: {
      email?: string;
      firstName?: string;
      lastName?: string;
      nrp?: number;
      role?: string;
      posisi?: string;
      phoneNumber?: string;
      avatar?: string;
      password?: string;
    }
  ) {
    const response = await this.client.put(`/api/superadmin/users/${id}`, data);
    return response.data;
  }

  async deleteUser(id: string) {
    const response = await this.client.delete(`/api/superadmin/users/${id}`);
    return response.data;
  }

  async getAllActivitiesAdmin(params?: {
    status?: string;
    activityName?: string;
    unitId?: string;
    mechanicId?: string;
    search?: string;
    page?: number;
    limit?: number;
    sortBy?: string;
    sortOrder?: string;
  }) {
    const response = await this.client.get("/api/superadmin/activities", {
      params,
    });
    return response.data;
  }

  async deleteActivityAdmin(id: string) {
    const response = await this.client.delete(
      `/api/superadmin/activities/${id}`
    );
    return response.data;
  }

  async getAllWorkTimesAdmin(params?: {
    mechanicId?: string;
    startDate?: string;
    endDate?: string;
    page?: number;
    limit?: number;
    sortBy?: string;
    sortOrder?: string;
  }) {
    const response = await this.client.get("/api/superadmin/work-times", {
      params,
    });
    return response.data;
  }

  async deleteWorkTimeAdmin(id: string) {
    const response = await this.client.delete(
      `/api/superadmin/work-times/${id}`
    );
    return response.data;
  }

  async getDashboardStats() {
    const response = await this.client.get("/api/superadmin/dashboard/stats");
    return response.data;
  }

  // Group Leader endpoints
  async getGroupLeaderActivities() {
    const response = await this.client.get("/api/groupleader/activities");
    return response.data;
  }

  async getGroupLeaderActivityById(id: string) {
    const response = await this.client.get(`/api/groupleader/activities/${id}`);
    return response.data;
  }

  async updateGroupLeaderActivity(
    id: string,
    data: {
      activityStatus?: string;
      description?: string;
      remarks?: string;
    }
  ) {
    const response = await this.client.put(
      `/api/groupleader/activities/${id}`,
      data
    );
    return response.data;
  }

  async assignMechanicsToActivityGroupLeader(activityId: string, mechanicIds: string[]) {
    const response = await this.client.post(
      `/api/groupleader/activities/${activityId}/assign-mechanics`,
      { mechanicIds }
    );
    return response.data;
  }

  async getGroupLeaderMechanics() {
    const response = await this.client.get("/api/groupleader/mechanics");
    return response.data;
  }

  // Supervisor endpoints
  async getSupervisorActivities() {
    const response = await this.client.get("/api/supervisor/activities");
    return response.data;
  }

  async getSupervisorActivityById(id: string) {
    const response = await this.client.get(`/api/supervisor/activities/${id}`);
    return response.data;
  }

  async updateSupervisorActivity(
    id: string,
    data: {
      activityStatus?: string;
      description?: string;
      remarks?: string;
    }
  ) {
    const response = await this.client.put(
      `/api/supervisor/activities/${id}`,
      data
    );
    return response.data;
  }

  async assignMechanicsToActivity(activityId: string, mechanicIds: string[]) {
    const response = await this.client.post(
      `/api/supervisor/activities/${activityId}/assign-mechanics`,
      { mechanicIds }
    );
    return response.data;
  }

  async getSupervisorMechanics() {
    const response = await this.client.get("/api/supervisor/mechanics");
    return response.data;
  }
}

export const apiClient = new ApiClient();
