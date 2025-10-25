import React, { useState, useEffect } from 'react';
import { Building2, Users as UsersIcon, TrendingUp, Calendar, Activity, Zap } from 'lucide-react';
import { supabase } from '../lib/supabase';
import type { Organization, User } from '../lib/types';
import { Card } from '../components/Card';
import { StatCardSkeleton, TableRowSkeleton } from '../components/LoadingSkeleton';

interface Stats {
  totalOrganizations: number;
  totalUsers: number;
  adminUsers: number;
  memberUsers: number;
}

export const Dashboard: React.FC = () => {
  const [stats, setStats] = useState<Stats>({
    totalOrganizations: 0,
    totalUsers: 0,
    adminUsers: 0,
    memberUsers: 0,
  });
  const [recentOrganizations, setRecentOrganizations] = useState<Organization[]>([]);
  const [recentUsers, setRecentUsers] = useState<(User & { organizations?: Organization })[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const fetchDashboardData = async () => {
    try {
      setLoading(true);
      setError(null);

      const [orgsResponse, usersResponse] = await Promise.all([
        supabase
          .from('organizations')
          .select('*')
          .order('created_at', { ascending: false })
          .limit(5),
        supabase
          .from('users')
          .select('*, organizations(*)')
          .order('created_at', { ascending: false })
          .limit(5),
      ]);

      if (orgsResponse.error) throw orgsResponse.error;
      if (usersResponse.error) throw usersResponse.error;

      const allOrgs = orgsResponse.data || [];
      const allUsers = usersResponse.data || [];

      setRecentOrganizations(allOrgs);
      setRecentUsers(allUsers);

      const [totalOrgsResponse, totalUsersResponse] = await Promise.all([
        supabase.from('organizations').select('id', { count: 'exact', head: true }),
        supabase.from('users').select('id, role', { count: 'exact' }),
      ]);

      const adminCount = totalUsersResponse.data?.filter(u => u.role === 'Admin').length || 0;
      const memberCount = totalUsersResponse.data?.filter(u => u.role === 'Member').length || 0;

      setStats({
        totalOrganizations: totalOrgsResponse.count || 0,
        totalUsers: (totalUsersResponse.data?.length || 0),
        adminUsers: adminCount,
        memberUsers: memberCount,
      });
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to fetch dashboard data');
    } finally {
      setLoading(false);
    }
  };

  const statCards = [
    {
      title: 'Total Organizations',
      value: stats.totalOrganizations,
      icon: Building2,
      gradient: 'from-primary-500 to-primary-600',
      bgGradient: 'from-primary-50 to-primary-100',
      iconColor: 'text-primary-600',
    },
    {
      title: 'Total Users',
      value: stats.totalUsers,
      icon: UsersIcon,
      gradient: 'from-accent-500 to-accent-600',
      bgGradient: 'from-accent-50 to-accent-100',
      iconColor: 'text-accent-600',
    },
    {
      title: 'Admin Users',
      value: stats.adminUsers,
      icon: TrendingUp,
      gradient: 'from-secondary-500 to-secondary-600',
      bgGradient: 'from-secondary-50 to-secondary-100',
      iconColor: 'text-secondary-600',
    },
    {
      title: 'Member Users',
      value: stats.memberUsers,
      icon: Activity,
      gradient: 'from-blue-500 to-blue-600',
      bgGradient: 'from-blue-50 to-blue-100',
      iconColor: 'text-blue-600',
    },
  ];

  if (error) {
    return (
      <div className="animate-slideUp">
        <div className="bg-red-50 border border-red-200 text-red-700 px-6 py-4 rounded-2xl shadow-soft">
          {error}
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-8 animate-slideUp">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-4xl font-bold text-gray-900 mb-2">Dashboard</h1>
          <p className="text-gray-600 flex items-center gap-2">
            <Zap className="w-4 h-4 text-accent-500" />
            Real-time overview of your organization
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        {loading ? (
          <>
            {[1, 2, 3, 4].map((i) => (
              <StatCardSkeleton key={i} />
            ))}
          </>
        ) : (
          statCards.map((stat, index) => {
            const Icon = stat.icon;
            return (
              <div
                key={stat.title}
                className="animate-slideUp"
                style={{ animationDelay: `${index * 0.1}s` }}
              >
                <Card className={`bg-gradient-to-br ${stat.bgGradient} border-none shadow-medium hover:shadow-hard transition-all duration-300 hover:-translate-y-1`}>
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <p className="text-sm font-medium text-gray-600 mb-2">{stat.title}</p>
                      <p className="text-3xl font-bold text-gray-900">{stat.value}</p>
                    </div>
                    <div className={`p-3 rounded-xl bg-white shadow-soft`}>
                      <Icon className={`w-6 h-6 ${stat.iconColor}`} />
                    </div>
                  </div>
                </Card>
              </div>
            );
          })
        )}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        <Card className="shadow-medium hover:shadow-hard transition-shadow duration-300 animate-slideInLeft">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-2xl font-bold text-gray-900">Recent Organizations</h2>
            <Building2 className="w-6 h-6 text-primary-500" />
          </div>
          {loading ? (
            <div className="space-y-3">
              {[1, 2, 3].map((i) => (
                <TableRowSkeleton key={i} />
              ))}
            </div>
          ) : recentOrganizations.length === 0 ? (
            <div className="text-center py-12">
              <Building2 className="w-16 h-16 mx-auto text-gray-300 mb-4" />
              <p className="text-gray-500">No organizations yet</p>
            </div>
          ) : (
            <div className="space-y-3">
              {recentOrganizations.map((org, index) => (
                <div
                  key={org.id}
                  className="p-4 bg-gradient-to-r from-gray-50 to-white rounded-xl hover:shadow-soft transition-all duration-200 border border-gray-100 animate-slideUp"
                  style={{ animationDelay: `${index * 0.05}s` }}
                >
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <h3 className="font-semibold text-gray-900 mb-1">{org.name}</h3>
                      <p className="text-sm text-gray-600 line-clamp-2">
                        {org.description || 'No description'}
                      </p>
                    </div>
                    <div className="flex items-center text-xs text-gray-500 ml-4 bg-white px-3 py-1 rounded-full shadow-sm">
                      <Calendar className="w-3 h-3 mr-1" />
                      {new Date(org.created_at).toLocaleDateString()}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </Card>

        <Card className="shadow-medium hover:shadow-hard transition-shadow duration-300 animate-slideInRight">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-2xl font-bold text-gray-900">Recent Users</h2>
            <UsersIcon className="w-6 h-6 text-accent-500" />
          </div>
          {loading ? (
            <div className="space-y-3">
              {[1, 2, 3].map((i) => (
                <TableRowSkeleton key={i} />
              ))}
            </div>
          ) : recentUsers.length === 0 ? (
            <div className="text-center py-12">
              <UsersIcon className="w-16 h-16 mx-auto text-gray-300 mb-4" />
              <p className="text-gray-500">No users yet</p>
            </div>
          ) : (
            <div className="space-y-3">
              {recentUsers.map((user, index) => (
                <div
                  key={user.id}
                  className="p-4 bg-gradient-to-r from-gray-50 to-white rounded-xl hover:shadow-soft transition-all duration-200 border border-gray-100 animate-slideUp"
                  style={{ animationDelay: `${index * 0.05}s` }}
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center flex-1">
                      <div className="w-10 h-10 rounded-full bg-gradient-to-br from-primary-400 to-secondary-400 flex items-center justify-center mr-3 shadow-soft">
                        <span className="text-white font-semibold text-sm">
                          {user.name.charAt(0).toUpperCase()}
                        </span>
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 mb-1">
                          <h3 className="font-semibold text-gray-900 truncate">{user.name}</h3>
                          <span
                            className={`px-2 py-0.5 rounded-full text-xs font-medium ${
                              user.role === 'Admin'
                                ? 'bg-primary-100 text-primary-700'
                                : 'bg-gray-200 text-gray-700'
                            }`}
                          >
                            {user.role}
                          </span>
                        </div>
                        <p className="text-sm text-gray-600 truncate">{user.email}</p>
                        <p className="text-xs text-gray-500 mt-1">
                          {user.organizations?.name || 'No organization'}
                        </p>
                      </div>
                    </div>
                    <div className="flex items-center text-xs text-gray-500 ml-4 bg-white px-3 py-1 rounded-full shadow-sm">
                      <Calendar className="w-3 h-3 mr-1" />
                      {new Date(user.created_at).toLocaleDateString()}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </Card>
      </div>
    </div>
  );
};
