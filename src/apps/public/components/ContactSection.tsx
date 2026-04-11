import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { FaEnvelope, FaUser, FaBuilding, FaPaperPlane } from 'react-icons/fa';
import { HiSparkles } from 'react-icons/hi';

const ContactSection: React.FC = () => {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    company: '',
    subject: '',
    message: '',
  });
  const [submitted, setSubmitted] = useState(false);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    // TODO: Connect to email service
    setSubmitted(true);
  };

  const subjects = [
    'Consulta general',
    'Compensación corporativa (B2B)',
    'Certificados NFT',
    'Soporte técnico',
    'Alianzas y partnerships',
    'Otro',
  ];

  return (
    <section
      id="contacto"
      className="!relative !overflow-hidden !py-20"
      style={{
        background: 'linear-gradient(180deg, #f0fdf4 0%, #ecfdf5 30%, #f8fafc 100%)',
      }}
    >
      {/* Decorative */}
      <div className="!absolute !top-10 !left-0 !w-72 !h-72 !bg-emerald-200 !rounded-full !filter !blur-3xl !opacity-20" />
      <div className="!absolute !bottom-10 !right-0 !w-72 !h-72 !bg-blue-200 !rounded-full !filter !blur-3xl !opacity-20" />

      <div className="!relative !z-10" style={{ maxWidth: '1280px', margin: '0 auto', padding: '0 24px' }}>
        {/* Header */}
        <div className="!text-center !max-w-3xl !mx-auto !mb-14">
          <motion.div
            initial={{ scale: 0 }}
            whileInView={{ scale: 1 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5 }}
            className="!inline-flex !items-center !gap-2 !bg-emerald-50 !text-emerald-600 !px-4 !py-2 !rounded-full !text-sm !font-semibold !mb-6"
          >
            <HiSparkles className="!text-emerald-500" />
            <span>Contacto</span>
          </motion.div>

          <motion.h2
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: 0.2 }}
            className="!text-4xl md:!text-5xl !font-bold !text-gray-900 !mb-4"
          >
            ¿Listo para{' '}
            <span
              style={{
                background: 'linear-gradient(to right, #22c55e, #16a34a)',
                WebkitBackgroundClip: 'text',
                WebkitTextFillColor: 'transparent',
              }}
            >
              compensar
            </span>
            ?
          </motion.h2>

          <motion.p
            initial={{ opacity: 0, y: 10 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: 0.3 }}
            className="!text-lg !text-gray-500"
          >
            Cuéntanos cómo podemos ayudarte. Respondemos en menos de 24 horas.
          </motion.p>
        </div>

        {/* Form Card */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6, delay: 0.2 }}
          className="!max-w-2xl !mx-auto"
        >
          {submitted ? (
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              className="!bg-white !rounded-3xl !shadow-xl !border !border-gray-100 !p-12 !text-center"
            >
              <div
                className="!mx-auto !mb-6 !w-16 !h-16 !rounded-full !flex !items-center !justify-center"
                style={{ background: 'linear-gradient(135deg, #22c55e, #16a34a)' }}
              >
                <FaPaperPlane className="!text-white !text-2xl" />
              </div>
              <h3 className="!text-2xl !font-bold !text-gray-900 !mb-3">
                ¡Mensaje recibido!
              </h3>
              <p className="!text-gray-500 !mb-6">
                Nos pondremos en contacto contigo pronto. Revisa tu correo electrónico.
              </p>
              <button
                onClick={() => {
                  setSubmitted(false);
                  setFormData({ name: '', email: '', company: '', subject: '', message: '' });
                }}
                className="!px-6 !py-2 !rounded-full !bg-gray-100 !text-gray-700 !font-medium hover:!bg-gray-200 !transition-colors"
              >
                Enviar otro mensaje
              </button>
            </motion.div>
          ) : (
            <form
              onSubmit={handleSubmit}
              className="!bg-white !rounded-3xl !shadow-xl !border !border-gray-100 !p-8 md:!p-10"
            >
              <div className="!grid md:!grid-cols-2 !gap-5 !mb-5">
                {/* Name */}
                <div>
                  <label className="!block !text-sm !font-medium !text-gray-700 !mb-1.5">
                    Nombre completo
                  </label>
                  <div className="!relative">
                    <FaUser className="!absolute !left-3 !top-1/2 !-translate-y-1/2 !text-gray-400 !text-sm" />
                    <input
                      type="text"
                      name="name"
                      required
                      value={formData.name}
                      onChange={handleChange}
                      placeholder="Tu nombre"
                      className="!w-full !pl-10 !pr-4 !py-3 !rounded-xl !border !border-gray-200 !bg-gray-50 !text-gray-900 !placeholder-gray-400 focus:!border-emerald-400 focus:!ring-2 focus:!ring-emerald-100 focus:!bg-white !outline-none !transition-all"
                    />
                  </div>
                </div>

                {/* Email */}
                <div>
                  <label className="!block !text-sm !font-medium !text-gray-700 !mb-1.5">
                    Correo electrónico
                  </label>
                  <div className="!relative">
                    <FaEnvelope className="!absolute !left-3 !top-1/2 !-translate-y-1/2 !text-gray-400 !text-sm" />
                    <input
                      type="email"
                      name="email"
                      required
                      value={formData.email}
                      onChange={handleChange}
                      placeholder="tu@email.com"
                      className="!w-full !pl-10 !pr-4 !py-3 !rounded-xl !border !border-gray-200 !bg-gray-50 !text-gray-900 !placeholder-gray-400 focus:!border-emerald-400 focus:!ring-2 focus:!ring-emerald-100 focus:!bg-white !outline-none !transition-all"
                    />
                  </div>
                </div>
              </div>

              <div className="!grid md:!grid-cols-2 !gap-5 !mb-5">
                {/* Company */}
                <div>
                  <label className="!block !text-sm !font-medium !text-gray-700 !mb-1.5">
                    Empresa <span className="!text-gray-400 !font-normal">(opcional)</span>
                  </label>
                  <div className="!relative">
                    <FaBuilding className="!absolute !left-3 !top-1/2 !-translate-y-1/2 !text-gray-400 !text-sm" />
                    <input
                      type="text"
                      name="company"
                      value={formData.company}
                      onChange={handleChange}
                      placeholder="Tu empresa"
                      className="!w-full !pl-10 !pr-4 !py-3 !rounded-xl !border !border-gray-200 !bg-gray-50 !text-gray-900 !placeholder-gray-400 focus:!border-emerald-400 focus:!ring-2 focus:!ring-emerald-100 focus:!bg-white !outline-none !transition-all"
                    />
                  </div>
                </div>

                {/* Subject */}
                <div>
                  <label className="!block !text-sm !font-medium !text-gray-700 !mb-1.5">
                    Asunto
                  </label>
                  <select
                    name="subject"
                    required
                    value={formData.subject}
                    onChange={handleChange}
                    className="!w-full !px-4 !py-3 !rounded-xl !border !border-gray-200 !bg-gray-50 !text-gray-900 focus:!border-emerald-400 focus:!ring-2 focus:!ring-emerald-100 focus:!bg-white !outline-none !transition-all !appearance-none"
                  >
                    <option value="">Selecciona un asunto</option>
                    {subjects.map((s) => (
                      <option key={s} value={s}>
                        {s}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              {/* Message */}
              <div className="!mb-6">
                <label className="!block !text-sm !font-medium !text-gray-700 !mb-1.5">
                  Mensaje
                </label>
                <textarea
                  name="message"
                  required
                  value={formData.message}
                  onChange={handleChange}
                  rows={4}
                  placeholder="Cuéntanos en qué podemos ayudarte..."
                  className="!w-full !px-4 !py-3 !rounded-xl !border !border-gray-200 !bg-gray-50 !text-gray-900 !placeholder-gray-400 focus:!border-emerald-400 focus:!ring-2 focus:!ring-emerald-100 focus:!bg-white !outline-none !transition-all !resize-none"
                />
              </div>

              {/* Submit */}
              <motion.button
                type="submit"
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                className="!w-full !py-3.5 !rounded-xl !font-semibold !text-white !shadow-lg !flex !items-center !justify-center !gap-2 !transition-all"
                style={{
                  background: 'linear-gradient(135deg, #22c55e, #16a34a)',
                }}
              >
                <FaPaperPlane className="!text-sm" />
                Enviar mensaje
              </motion.button>

              <p className="!text-center !text-xs !text-gray-400 !mt-4">
                Al enviar aceptas nuestra política de privacidad. No compartimos tus datos.
              </p>
            </form>
          )}
        </motion.div>
      </div>
    </section>
  );
};

export default ContactSection;
