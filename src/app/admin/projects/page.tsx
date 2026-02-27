'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { AdminSidebar } from '@/components/AdminSidebar';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Plus, Trash2, Edit, Eye, RefreshCw, X } from 'lucide-react';
import { supabase, fetchAllProjects, fetchCategories } from '@/lib/supabase';
import { Project } from '@/types';
import { toast } from 'sonner';
import Link from 'next/link';
import { slugify } from '@/lib/utils';

export default function AdminProjectsPage() {
  const router = useRouter();
  const [projects, setProjects] = useState<Project[]>([]);
  const [loading, setLoading] = useState(true);
  const [user, setUser] = useState<any>(null);
  const [isAuthorized, setIsAuthorized] = useState(false);
  const [showAddModal, setShowAddModal] = useState(false);
  const [categories, setCategories] = useState<any[]>([]);
  const [formData, setFormData] = useState({
    title: '',
    slug: '',
    category: 'Web Development',
    description: '',
    abstract: '',
    synopsis: '',
    price: '',
    discounted_price: '',
    video_url: '',
    github_repo_link: '',
    thumbnail_url: '',
  });
  const [submitting, setSubmitting] = useState(false);
  const [slugEdited, setSlugEdited] = useState(false);
  const [editingProject, setEditingProject] = useState<Project | null>(null);

  useEffect(() => {
    const checkAuth = () => {
      if (typeof window !== 'undefined') {
        const isAuth = localStorage.getItem('adminAuth') || sessionStorage.getItem('adminAuth');
        if (!isAuth) {
          window.location.href = '/admin';
          return;
        }
      }
      
      setIsAuthorized(true);
      setUser({ email: 'admin@projectready4u.com' });
      loadProjects();
      loadCategories();
    };

    checkAuth();
  }, []);

  const loadCategories = async () => {
    try {
      const data = await fetchCategories();
      setCategories(data);
      if (data.length > 0) {
        setFormData(prev => ({...prev, category: data[0].name}));
      }
    } catch (error) {
      console.error('Failed to load categories:', error);
      // Fallback categories
      setCategories([
        { name: 'Web Development', id: '1' },
        { name: 'Mobile App', id: '2' },
        { name: 'Machine Learning', id: '3' },
        { name: 'Database', id: '4' },
        { name: 'DevOps', id: '5' },
        { name: 'Game Development', id: '6' },
        { name: 'Data Science', id: '7' },
        { name: 'Cloud Computing', id: '8' }
      ]);
    }
  };

  const loadProjects = async () => {
    try {
      const data = await fetchAllProjects();
      setProjects(data);
    } catch (error) {
      toast.error('Failed to load projects');
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Are you sure you want to delete this project?')) return;

    try {
      const { error } = await supabase.from('projects').delete().eq('id', id);
      if (error) throw error;
      toast.success('Project deleted successfully');
      loadProjects();
    } catch (error: any) {
      toast.error(error.message || 'Failed to delete project');
    }
  };

  const handleEditProject = (project: Project) => {
    setEditingProject(project);
    setFormData({
      title: project.title,
      slug: project.slug,
      category: project.category,
      description: project.description,
      abstract: project.abstract,
      synopsis: project.synopsis,
      price: String(project.price),
      discounted_price: String(project.discounted_price),
      video_url: project.video_url,
      github_repo_link: project.github_repo_link,
      thumbnail_url: project.thumbnail_url,
    });
    setSlugEdited(true);
    setShowAddModal(true);
  };

  const handleAddProject = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.title) {
      toast.error('Title is required');
      return;
    }

    // Auto-generate slug if empty
    let finalSlug = formData.slug;
    if (!finalSlug || finalSlug.trim() === '') {
      finalSlug = slugify(formData.title);
    }

    if (!finalSlug) {
      toast.error('Could not generate slug from title');
      return;
    }

    setSubmitting(true);
    try {
      if (editingProject) {
        // Update existing project
        const { error } = await supabase
          .from('projects')
          .update({
            title: formData.title,
            slug: finalSlug,
            category: formData.category,
            description: formData.description,
            abstract: formData.abstract,
            synopsis: formData.synopsis,
            price: parseFloat(formData.price) || 0,
            discounted_price: parseFloat(formData.discounted_price) || 0,
            video_url: formData.video_url,
            github_repo_link: formData.github_repo_link,
            thumbnail_url: formData.thumbnail_url,
          })
          .eq('id', editingProject.id);

        if (error) throw error;
        toast.success('Project updated successfully');
      } else {
        // Add new project
        const { error } = await supabase.from('projects').insert([{
          title: formData.title,
          slug: finalSlug,
          category: formData.category,
          description: formData.description,
          abstract: formData.abstract,
          synopsis: formData.synopsis,
          price: parseFloat(formData.price) || 0,
          discounted_price: parseFloat(formData.discounted_price) || 0,
          video_url: formData.video_url,
          github_repo_link: formData.github_repo_link,
          thumbnail_url: formData.thumbnail_url,
          includes_source: true,
          includes_report: true,
          includes_ppt: true,
          includes_synopsis: true,
          includes_viva: true,
          includes_readme: true,
        }]);

        if (error) throw error;
        toast.success('Project added successfully');
      }
      
      setShowAddModal(false);
      setEditingProject(null);
      setSlugEdited(false);
      setFormData({
        title: '',
        slug: '',
        category: categories.length > 0 ? categories[0].name : 'Web Development',
        description: '',
        abstract: '',
        synopsis: '',
        price: '',
        discounted_price: '',
        video_url: '',
        github_repo_link: '',
        thumbnail_url: '',
      });
      loadProjects();
    } catch (error: any) {
      console.error('Error saving project:', error);
      toast.error(error.message || 'Failed to save project');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="flex h-screen bg-gradient-to-b from-[#0a0a0a] via-[#0a0a0a] to-[#111111]">
      <AdminSidebar userName={user?.email?.split('@')[0]} />
      <main className="flex-1 overflow-auto">
        {!isAuthorized ? (
          <div className="flex items-center justify-center h-screen">
            <RefreshCw className="w-8 h-8 animate-spin text-violet-500" />
          </div>
        ) : (
          <>
            {/* Header */}
        <div className="border-b border-white/10 p-8">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-4xl font-bold text-white mb-2">Projects</h1>
              <p className="text-gray-400">Manage your academic projects</p>
            </div>
            <div className="flex gap-2">
              <Button
                onClick={loadProjects}
                variant="ghost"
                className="text-gray-300 hover:text-white hover:bg-white/10"
              >
                <RefreshCw className="w-4 h-4" />
              </Button>
              <Button 
                onClick={() => setShowAddModal(true)}
                className="bg-gradient-to-r from-violet-600 to-indigo-600 hover:from-violet-700 hover:to-indigo-700 text-white">
                <Plus className="w-4 h-4 mr-2" />
                Add Project
              </Button>
            </div>
          </div>
        </div>

        {/* Content */}
        <div className="p-8">
          {loading ? (
            <div className="flex justify-center items-center py-12">
              <RefreshCw className="w-8 h-8 animate-spin text-violet-500" />
            </div>
          ) : projects.length > 0 ? (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-white/10">
                    <th className="text-left py-4 px-6 text-white font-semibold">Title</th>
                    <th className="text-left py-4 px-6 text-white font-semibold">Category</th>
                    <th className="text-left py-4 px-6 text-white font-semibold">Price</th>
                    <th className="text-left py-4 px-6 text-white font-semibold">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {projects.map((project) => (
                    <tr key={project.id} className="border-b border-white/5 hover:bg-white/5 transition-colors">
                      <td className="py-4 px-6 text-white">{project.title}</td>
                      <td className="py-4 px-6 text-gray-400">{project.category}</td>
                      <td className="py-4 px-6 text-white">₹{project.price}</td>
                      <td className="py-4 px-6">
                        <div className="flex gap-2">
                          <Link href={`/projects/${project.slug}`}>
                            <Button variant="ghost" size="sm" className="text-blue-400 hover:text-blue-300">
                              <Eye className="w-4 h-4" />
                            </Button>
                          </Link>
                          <Button 
                            variant="ghost" 
                            size="sm" 
                            className="text-amber-400 hover:text-amber-300"
                            onClick={() => handleEditProject(project)}
                          >
                            <Edit className="w-4 h-4" />
                          </Button>
                          <Button
                            variant="ghost"
                            size="sm"
                            className="text-red-400 hover:text-red-300"
                            onClick={() => handleDelete(project.id)}
                          >
                            <Trash2 className="w-4 h-4" />
                          </Button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          ) : (
            <Card className="border border-white/10 bg-white/5 p-12 text-center">
              <Plus className="w-12 h-12 text-gray-400 mx-auto mb-4" />
              <h3 className="text-xl font-semibold text-white mb-2">No Projects Yet</h3>
              <p className="text-gray-400 mb-6">Get started by adding your first academic project.</p>
              <Button 
                onClick={() => setShowAddModal(true)}
                className="bg-gradient-to-r from-violet-600 to-indigo-600 hover:from-violet-700 hover:to-indigo-700">
                <Plus className="w-4 h-4 mr-2" />
                Add Your First Project
              </Button>
            </Card>
          )}
        </div>

        {/* Add Project Modal */}
        {showAddModal && (
          <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4 z-50">
            <Card className="w-full max-w-2xl max-h-[90vh] overflow-y-auto border border-white/10 bg-[#0a0a0a]">
              <div className="p-6 border-b border-white/10 flex items-center justify-between sticky top-0 bg-[#0a0a0a]">
                <h2 className="text-2xl font-bold text-white">{editingProject ? 'Edit Project' : 'Add New Project'}</h2>
                <button
                  onClick={() => {
                    setShowAddModal(false);
                    setEditingProject(null);
                    setSlugEdited(false);
                  }}
                  className="text-gray-400 hover:text-white"
                >
                  <X className="w-6 h-6" />
                </button>
              </div>

              <form onSubmit={handleAddProject} className="p-6 space-y-4">
                {/* Title & Slug */}
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="text-white text-sm font-medium">Title *</label>
                    <Input
                      type="text"
                      placeholder="Project title"
                      value={formData.title}
                      onChange={(e) => {
                        const newTitle = e.target.value;
                        setFormData({...formData, title: newTitle});
                        // Auto-generate slug if user hasn't manually edited it
                        if (!slugEdited) {
                          setFormData(prev => ({...prev, slug: slugify(newTitle)}));
                        }
                      }}
                      className="mt-1 bg-white/5 border-white/10 text-white"
                      required
                    />
                  </div>
                  <div>
                    <label className="text-white text-sm font-medium">Slug (auto-generated)</label>
                    <Input
                      type="text"
                      placeholder="auto-generated from title"
                      value={formData.slug}
                      onChange={(e) => {
                        setFormData({...formData, slug: e.target.value});
                        setSlugEdited(true);
                      }}
                      className="mt-1 bg-white/5 border-white/10 text-white"
                    />
                    <p className="text-xs text-gray-500 mt-1">Generated from title or edit manually</p>
                  </div>
                </div>

                {/* Category & Prices */}
                <div className="grid grid-cols-3 gap-4">
                  <div>
                    <label className="text-white text-sm font-medium">Category</label>
                    <select
                      value={formData.category}
                      onChange={(e) => setFormData({...formData, category: e.target.value})}
                      className="mt-1 w-full bg-white/5 border border-white/10 text-white rounded px-3 py-2 focus:outline-none focus:ring-2 focus:ring-violet-500"
                    >
                      {categories.length > 0 ? (
                        categories.map((cat: any) => (
                          <option key={cat.id} value={cat.name} className="bg-gray-900 text-white">
                            {cat.name}
                          </option>
                        ))
                      ) : (
                        <>
                          <option value="Web Development" className="bg-gray-900 text-white">Web Development</option>
                          <option value="Mobile App" className="bg-gray-900 text-white">Mobile App</option>
                          <option value="Machine Learning" className="bg-gray-900 text-white">Machine Learning</option>
                          <option value="Database" className="bg-gray-900 text-white">Database</option>
                          <option value="DevOps" className="bg-gray-900 text-white">DevOps</option>
                          <option value="Game Development" className="bg-gray-900 text-white">Game Development</option>
                          <option value="Data Science" className="bg-gray-900 text-white">Data Science</option>
                          <option value="Cloud Computing" className="bg-gray-900 text-white">Cloud Computing</option>
                        </>
                      )}
                    </select>
                  </div>
                  <div>
                    <label className="text-white text-sm font-medium">Price</label>
                    <Input
                      type="number"
                      placeholder="5000"
                      value={formData.price}
                      onChange={(e) => setFormData({...formData, price: e.target.value})}
                      className="mt-1 bg-white/5 border-white/10 text-white"
                    />
                  </div>
                  <div>
                    <label className="text-white text-sm font-medium">Discount Price</label>
                    <Input
                      type="number"
                      placeholder="2999"
                      value={formData.discounted_price}
                      onChange={(e) => setFormData({...formData, discounted_price: e.target.value})}
                      className="mt-1 bg-white/5 border-white/10 text-white"
                    />
                  </div>
                </div>

                {/* Description & Abstract */}
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="text-white text-sm font-medium">Description</label>
                    <textarea
                      placeholder="Short description"
                      value={formData.description}
                      onChange={(e) => setFormData({...formData, description: e.target.value})}
                      className="mt-1 w-full bg-white/5 border border-white/10 text-white rounded px-3 py-2"
                      rows={3}
                    />
                  </div>
                  <div>
                    <label className="text-white text-sm font-medium">Abstract</label>
                    <textarea
                      placeholder="Project abstract"
                      value={formData.abstract}
                      onChange={(e) => setFormData({...formData, abstract: e.target.value})}
                      className="mt-1 w-full bg-white/5 border border-white/10 text-white rounded px-3 py-2"
                      rows={3}
                    />
                  </div>
                </div>

                {/* Synopsis */}
                <div>
                  <label className="text-white text-sm font-medium">Synopsis</label>
                  <textarea
                    placeholder="Detailed synopsis"
                    value={formData.synopsis}
                    onChange={(e) => setFormData({...formData, synopsis: e.target.value})}
                    className="mt-1 w-full bg-white/5 border border-white/10 text-white rounded px-3 py-2"
                    rows={3}
                  />
                </div>

                {/* Links */}
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="text-white text-sm font-medium">Video URL (YouTube)</label>
                    <Input
                      type="url"
                      placeholder="https://youtube.com/watch?v=..."
                      value={formData.video_url}
                      onChange={(e) => setFormData({...formData, video_url: e.target.value})}
                      className="mt-1 bg-white/5 border-white/10 text-white"
                    />
                  </div>
                  <div>
                    <label className="text-white text-sm font-medium">GitHub Repo</label>
                    <Input
                      type="url"
                      placeholder="https://github.com/user/repo"
                      value={formData.github_repo_link}
                      onChange={(e) => setFormData({...formData, github_repo_link: e.target.value})}
                      className="mt-1 bg-white/5 border-white/10 text-white"
                    />
                  </div>
                </div>

                {/* Thumbnail */}
                <div>
                  <label className="text-white text-sm font-medium">Thumbnail URL</label>
                  <Input
                    type="url"
                    placeholder="https://..."
                    value={formData.thumbnail_url}
                    onChange={(e) => setFormData({...formData, thumbnail_url: e.target.value})}
                    className="mt-1 bg-white/5 border-white/10 text-white"
                  />
                </div>

                {/* Buttons */}
                <div className="flex gap-3 mt-6">
                  <Button
                    type="button"
                    onClick={() => setShowAddModal(false)}
                    variant="ghost"
                    className="flex-1 text-gray-300 hover:text-white hover:bg-white/20"
                  >
                    Cancel
                  </Button>
                  <Button
                    type="submit"
                    disabled={submitting}
                    className="flex-1 bg-gradient-to-r from-violet-600 to-indigo-600 hover:from-violet-700 hover:to-indigo-700"
                  >
                    {submitting ? 'Saving...' : editingProject ? 'Update Project' : 'Add Project'}
                  </Button>
                </div>
              </form>
            </Card>
          </div>
        )}
          </>
        )}
      </main>
    </div>
  );
}
