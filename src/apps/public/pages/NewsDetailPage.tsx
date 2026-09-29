import { useEffect, useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import {
  fetchNewsBySlug,
  formatNewsDate,
  type NewsArticleDetail,
} from '../services/newsService';
import NewsletterSignup from '../components/NewsletterSignup';
import Header from '../components/Header';
import Footer from '../components/Footer';
import './BlogPage.css';

/**
 * Ficha de una noticia.
 *
 * Publica contenido propio: titular, resumen, puntos clave y "por qué importa".
 * El texto original del medio NUNCA se reproduce — solo se enlaza, con
 * rel="nofollow" para no transferir autoridad a docenas de dominios externos.
 */
const NewsDetailPage = () => {
  const { slug } = useParams<{ slug: string }>();
  const [article, setArticle] = useState<NewsArticleDetail | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let alive = true;

    const load = async () => {
      if (!slug) return;
      setLoading(true);
      const data = await fetchNewsBySlug(slug);
      if (!alive) return;
      setArticle(data);
      setLoading(false);

      // Metadatos para compartir. Es lo que se puede hacer sin SSR; el shell
      // renderizado en Express (paso 11) es lo que ven los buscadores.
      if (data) {
        document.title = `${data.title} | CompensaTuViaje`;
        const desc = document.querySelector('meta[name="description"]');
        if (desc && data.summary) desc.setAttribute('content', data.summary.slice(0, 155));
      }
    };

    load();
    return () => {
      alive = false;
    };
  }, [slug]);

  if (loading) {
    return (
      <div className="blog-page">
        <Header />
        <main>
          <section className="blog-article">
            <div className="blog-card__placeholder-block blog-card__placeholder-block--title" />
            <div className="blog-card__placeholder-block" />
            <div className="blog-card__placeholder-block" />
          </section>
        </main>
        <Footer />
      </div>
    );
  }

  if (!article) {
    return (
      <div className="blog-page">
        <Header />
        <main>
          <section className="blog-empty">
            <h1>Noticia no encontrada</h1>
            <p>Puede que se haya archivado o que el enlace sea incorrecto.</p>
            <Link to="/blog" className="blog-btn">
              Ver todas las noticias
            </Link>
          </section>
        </main>
        <Footer />
      </div>
    );
  }

  return (
    <div className="blog-page">
      <Header />
      <main>
        <article className="blog-article">
          <nav className="blog-article__breadcrumb">
            <Link to="/blog">Noticias</Link>
            <span aria-hidden="true"> / </span>
            <span>{article.categories[0] ?? 'Sector'}</span>
          </nav>

          <h1 className="blog-article__title">{article.title}</h1>

          <div className="blog-article__meta">
            <span className="blog-card__badge">{article.source.name ?? 'Fuente'}</span>
            <time dateTime={article.publishedAt ?? undefined}>
              {formatNewsDate(article.publishedAt)}
            </time>
          </div>

          {article.image && (
            <figure className="blog-article__figure">
              <img src={article.image.url} alt="" className="blog-article__image" />
              {article.image.aiGenerated && (
                <figcaption className="blog-card__caption">Imagen generada con IA</figcaption>
              )}
            </figure>
          )}

          {article.summary && <p className="blog-article__summary">{article.summary}</p>}

          {article.keyPoints.length > 0 && (
            <ul className="blog-article__points">
              {article.keyPoints.map((p, i) => (
                <li key={i}>{p}</li>
              ))}
            </ul>
          )}

          {article.whyItMatters && (
            <aside className="blog-article__why">
              <strong>Por qué importa</strong>
              <p>{article.whyItMatters}</p>
            </aside>
          )}

          <div className="blog-article__categories">
            {article.categories.map((c) => (
              <span key={c} className="blog-card__badge">
                {c}
              </span>
            ))}
          </div>

          <p className="blog-article__source">
            Fuente:{' '}
            <a href={article.source.url} target="_blank" rel="nofollow noopener noreferrer">
              {article.source.name ?? article.source.url}
            </a>
          </p>
        </article>

        {article.related.length > 0 && (
          <section className="blog-list">
            <h2 className="blog-related__title">También te puede interesar</h2>
            {article.related.map((r) => (
              <article key={r.slug} className="blog-card">
                <div className="blog-card__meta">
                  <span className="blog-card__badge">{r.source.name ?? 'Fuente'}</span>
                  <span className="blog-card__date">{formatNewsDate(r.publishedAt)}</span>
                </div>
                <h3 className="blog-card__title">
                  <Link to={`/blog/${r.slug}`}>{r.title}</Link>
                </h3>
                <p className="blog-card__description">{r.summary}</p>
              </article>
            ))}
          </section>
        )}

        <NewsletterSignup />
      </main>
      <Footer />
    </div>
  );
};

export default NewsDetailPage;
