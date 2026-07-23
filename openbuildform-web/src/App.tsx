import { FormEvent, useEffect, useState } from "react";
import "./App.css";

interface Template {
  id: string;
  ownerUserId: string;
  name: string;
  slug: string;
  description: string | null;
  templateStatusId: number;
  currentVersion: number;
  createdAt: string;
  updatedAt: string;
  publishedAt: string | null;
}

interface CreateTemplateRequest {
  ownerUserId: string;
  name: string;
  slug: string;
  description: string;
}

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL;

const DUMMY_USER_ID = "11111111-1111-1111-1111-111111111111";

function App() {
  const [templates, setTemplates] = useState<Template[]>([]);

  const [name, setName] = useState("");
  const [slug, setSlug] = useState("");
  const [description, setDescription] = useState("");

  const [searchName, setSearchName] = useState("");

  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState("");

  async function loadTemplates(search = "") {
    setLoading(true);
    setMessage("");

    try {
      const params = new URLSearchParams();

      if (search.trim()) {
        params.set("name", search.trim());
      }

      const queryString = params.toString();

      const url = queryString
        ? `${API_BASE_URL}/api/templates?${queryString}`
        : `${API_BASE_URL}/api/templates`;

      const response = await fetch(url);

      if (!response.ok) {
        throw new Error(`GET failed: HTTP ${response.status}`);
      }

      const data: Template[] = await response.json();

      setTemplates(data);
    } catch (error) {
      console.error(error);
      setMessage("Failed to load templates.");
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    void loadTemplates("");
  }, []);

  async function handleCreate(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    if (!name.trim()) {
      setMessage("Name is required.");
      return;
    }

    if (!slug.trim()) {
      setMessage("Slug is required.");
      return;
    }

    const request: CreateTemplateRequest = {
      ownerUserId: DUMMY_USER_ID,
      name: name.trim(),
      slug: slug.trim(),
      description: description.trim(),
    };

    setSaving(true);
    setMessage("");

    try {
      const response = await fetch(`${API_BASE_URL}/api/templates`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(request),
      });

      if (!response.ok) {
        const responseText = await response.text();
        throw new Error(
          `POST failed: HTTP ${response.status} ${responseText}`
        );
      }

      setName("");
      setSlug("");
      setDescription("");

      setMessage("Template created.");

      await loadTemplates(searchName);
    } catch (error) {
      console.error(error);
      setMessage("Failed to create template.");
    } finally {
      setSaving(false);
    }
  }

  async function handleSearch(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    await loadTemplates(searchName);
  }

  async function handleDelete(template: Template) {
    const confirmed = window.confirm(
      `Delete template "${template.name}"?`
    );

    if (!confirmed) {
      return;
    }

    setMessage("");

    try {
      const response = await fetch(
        `${API_BASE_URL}/api/templates/${template.id}`,
        {
          method: "DELETE",
        }
      );

      if (!response.ok && response.status !== 204) {
        throw new Error(`DELETE failed: HTTP ${response.status}`);
      }

      setMessage("Template deleted.");

      await loadTemplates(searchName);
    } catch (error) {
      console.error(error);
      setMessage("Failed to delete template.");
    }
  }

  return (
    <main className="page">
      <div className="container">
        <header>
          <h1>OpenBuildForm</h1>
          <p className="subtitle">Template CRUD PoC</p>
        </header>

        <section className="card">
          <h2>Create Template</h2>

          <form onSubmit={handleCreate} className="form">
            <label>
              Name
              <input
                value={name}
                onChange={(event) => setName(event.target.value)}
                placeholder="Haircut Booking"
              />
            </label>

            <label>
              Slug
              <input
                value={slug}
                onChange={(event) => setSlug(event.target.value)}
                placeholder="haircut-booking"
              />
            </label>

            <label>
              Description
              <textarea
                value={description}
                onChange={(event) =>
                  setDescription(event.target.value)
                }
                placeholder="Describe this template..."
                rows={4}
              />
            </label>

            <button type="submit" disabled={saving}>
              {saving ? "Creating..." : "Create Template"}
            </button>
          </form>
        </section>

        <section className="card">
          <h2>Templates</h2>

          <form onSubmit={handleSearch} className="search">
            <input
              value={searchName}
              onChange={(event) =>
                setSearchName(event.target.value)
              }
              placeholder="Search by template name"
            />

            <button type="submit">Search</button>

            <button
              type="button"
              className="secondary"
              onClick={() => {
                setSearchName("");
                void loadTemplates("");
              }}
            >
              Clear
            </button>
          </form>

          {message && <p className="message">{message}</p>}

          {loading ? (
            <p>Loading...</p>
          ) : templates.length === 0 ? (
            <p>No templates found.</p>
          ) : (
            <div className="template-list">
              {templates.map((template) => (
                <article
                  className="template-row"
                  key={template.id}
                >
                  <div>
                    <h3>{template.name}</h3>

                    <p>{template.description || "No description"}</p>

                    <div className="metadata">
                      <span>Slug: {template.slug}</span>
                      <span>Version: {template.currentVersion}</span>
                      <span>ID: {template.id}</span>
                    </div>
                  </div>

                  <button
                    type="button"
                    className="danger"
                    onClick={() => void handleDelete(template)}
                  >
                    Delete
                  </button>
                </article>
              ))}
            </div>
          )}
        </section>
      </div>
    </main>
  );
}

export default App;