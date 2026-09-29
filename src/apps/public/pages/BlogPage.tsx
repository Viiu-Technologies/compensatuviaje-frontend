import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import {
  fetchNews,
  fetchNewsCategories,
  formatNewsDate,
  type NewsArticle,
  type NewsCategory,
} from '../services/newsService';
import NewsletterSignup from '../components/NewsletterSignup';
import Header from '../components/Header';
import Footer from '../components/Footer';
import './BlogPage.css';

/**
 * Sección de noticias.
 *
 * Antes leía RSS de terceros desde el navegador y enlazaba al medio original.
 * Ahora publica fichas propias: titular y resumen redactados por nosotros, y
 * una lectura sectorial ("por qué importa") que no está en la fuente.
 *
 * Se conservan las clases de BlogPage.css para no romper el diseño del landing.
 */
const BlogPage = () => {
  const [articles, setArticles] = useState<NewsArticle[]>([]);
  const [categories, setCategories] = useState<NewsCategory[]>([]);
  const [activeCategory, setActiveCategory] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let alive = true;

    const load = async () => {
      setLoading(true);
      const [{ articles: data }, cats] = await Promise.all([
        fetchNews({ category: activeCategory ?? undefined, limit: 12 }),
        categories.length ? Promise.resolve(categories) : fetchNewsCategories(),
      ]);
      if (!alive) return;
      setArticles(data);
      if (!categories.length) setCategories(cats);
      setLoading(false);
    };

    load();
    return () => {
      alive = false;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [activeCategory]);

  // Solo se ofrecen las categorías que de verdad tienen artículos.
  const usedCategories = categories.filter((c) =>
    activeCategory ? true : articles.some((a) => a.categories.includes(c.slug))
  );

  return (
    <div className="blog-page">
      <Header />
      <main>
        <section className="blog-hero">
          <div className="blog-hero__panel">
            <span className="blog-hero__eyebrow">Noticias del sector</span>
            <h1 className="blog-hero__title">
              Regulación, emisiones y sostenibilidad para el transporte y la logística en Chile.
            </h1>
            <p className="blog-hero__lead">
              Seguimos organismos oficiales, gremios y prensa especializada. Cada ficha es un
              resumen propio, con lo que la noticia significa para una empresa de transporte.
            </p>
            <div className="blog-hero__actions">
              <Link to="/" className="blog-btn">
                Volver a la landing
              </Link>
              <a
                href="/api/news/feed.xml"
                target="_blank"
                rel="noreferrer"
                className="blog-btn blog-btn--outline"
              >
                Suscribirse por RSS
              </a>
            </div>
          </div>
        </section>

        <section className="blog-insights">
          <article className="blog-insights__card">
            <span className="blog-insights__label">Revisado antes de publicar</span>
            <p className="blog-insights__text">
              Nada se publica automáticamente. Cada noticia pasa por revisión humana antes de
              aparecer aquí.
            </p>
          </article>
          <article className="blog-insights__card">
            <span className="blog-insights__label">Por qué importa</span>
            <p className="blog-insights__text">
              Además del resumen, cada ficha explica la consecuencia concreta para empresas de
              transporte y logística.
            </p>
          </article>
        </section>

        {usedCategories.length > 0 && (
          <section className="blog-filters">
            <button
              type="button"
              onClick={() => setActiveCategory(null)}
              className={`blog-filter ${activeCategory === null ? 'blog-filter--active' : ''}`}
            >
              Todas
            </button>
            {usedCategories.map((c) => (
              <button
                key={c.slug}
                type="button"
                onClick={() => setActiveCategory(c.slug)}
                className={`blog-filter ${activeCategory === c.slug ? 'blog-filter--active' : ''}`}
              >
                {c.label}
              </button>
            ))}
          </section>
        )}

        <section className="blog-list">
          {loading ? (
            Array.from({ length: 6 }).map((_, index) => (
              <article key={index} className="blog-card blog-card--placeholder">
                <div className="blog-card__meta">
                  <div className="blog-card__placeholder-line blog-card__placeholder-line--short" />
                  <div className="blog-card__placeholder-line blog-card__placeholder-line--tiny" />
                </div>
                <div className="blog-card__placeholder-block blog-card__placeholder-block--title" />
                <div className="blog-card__placeholder-block" />
                <div className="blog-card__placeholder-block blog-card__placeholder-block--small" />
                <div className="blog-card__placeholder-block blog-card__placeholder-block--button" />
              </article>
            ))
          ) : articles.length > 0 ? (
            articles.map((article) => (
              <article key={article.slug} className="blog-card">
                {article.image && (
                  <figure className="blog-card__figure">
                    <img
                      src={article.image.url}
                      alt=""
                      loading="lazy"
                      className="blog-card__image"
                    />
                    {article.image.aiGenerated && (
                      <figcaption className="blog-card__caption">Imagen generada con IA</figcaption>
                    )}
                  </figure>
                )}

                <div className="blog-card__meta">
                  <span className="blog-card__badge">{article.source.name ?? 'Fuente'}</span>
                  <span className="blog-card__date">
                    {formatNewsDate(article.publishedAt) || 'Reciente'}
                  </span>
                </div>

                <h2 className="blog-card__title">
                  <Link to={`/blog/${article.slug}`}>{article.title}</Link>
                </h2>

                <p className="blog-card__description">{article.summary}</p>

                {article.whyItMatters && (
                  <p className="blog-card__why">
                    <strong>Por qué importa:</strong> {article.whyItMatters}
                  </p>
                )}

                <Link to={`/blog/${article.slug}`} className="blog-card__link">
                  Leer la ficha →
                </Link>
              </article>
            ))
          ) : (
            <div className="blog-empty">
              <p>
                {activeCategory
                  ? 'No hay noticias publicadas en esta categoría todavía.'
                  : 'No hay noticias publicadas en este momento. Vuelve a intentarlo en unos minutos.'}
              </p>
            </div>
          )}
        </section>

        <NewsletterSignup />
      </main>
      <Footer />
    </div>
  );
};

export default BlogPage;
