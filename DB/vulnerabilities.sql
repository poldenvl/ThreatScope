--
-- PostgreSQL database dump
--

-- Dumped from database version 15.0
-- Dumped by pg_dump version 15.0

-- Started on 2024-04-23 01:26:17

SET statement_timeout = 0;
SET lock_timeout = 0;
SET idle_in_transaction_session_timeout = 0;
SET client_encoding = 'UTF8';
SET standard_conforming_strings = on;
SELECT pg_catalog.set_config('search_path', '', false);
SET check_function_bodies = false;
SET xmloption = content;
SET client_min_messages = warning;
SET row_security = off;

SET default_tablespace = '';

SET default_table_access_method = heap;

--
-- TOC entry 219 (class 1259 OID 16861)
-- Name: Errorlist; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public."Errorlist" (
    error_id bigint NOT NULL,
    errorname character varying(128),
    errordescription character varying(256)
);


ALTER TABLE public."Errorlist" OWNER TO postgres;

--
-- TOC entry 215 (class 1259 OID 16821)
-- Name: Markups; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public."Markups" (
    record_id bigint NOT NULL,
    status_id bigint,
    severity_id bigint,
    user_id bigint
);


ALTER TABLE public."Markups" OWNER TO postgres;

--
-- TOC entry 218 (class 1259 OID 16856)
-- Name: Recordlist; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public."Recordlist" (
    record_id bigint NOT NULL,
    error_id bigint,
    location character varying(64),
    description character varying(128),
    line bigint
);


ALTER TABLE public."Recordlist" OWNER TO postgres;

--
-- TOC entry 216 (class 1259 OID 16831)
-- Name: Severity; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public."Severity" (
    severity_id bigint NOT NULL,
    severityname character varying(20)
);


ALTER TABLE public."Severity" OWNER TO postgres;

--
-- TOC entry 217 (class 1259 OID 16834)
-- Name: Status; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public."Status" (
    status_id bigint NOT NULL,
    statusname character varying(20)
);


ALTER TABLE public."Status" OWNER TO postgres;

--
-- TOC entry 214 (class 1259 OID 16816)
-- Name: Users; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public."Users" (
    user_id bigint NOT NULL,
    username character varying(20),
    password character varying(64)
);


ALTER TABLE public."Users" OWNER TO postgres;

--
-- TOC entry 3201 (class 2606 OID 16865)
-- Name: Errorlist Errorlist_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."Errorlist"
    ADD CONSTRAINT "Errorlist_pkey" PRIMARY KEY (error_id);


--
-- TOC entry 3199 (class 2606 OID 16860)
-- Name: Recordlist Recordlist_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."Recordlist"
    ADD CONSTRAINT "Recordlist_pkey" PRIMARY KEY (record_id);


--
-- TOC entry 3195 (class 2606 OID 16845)
-- Name: Severity Severity_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."Severity"
    ADD CONSTRAINT "Severity_pkey" PRIMARY KEY (severity_id);


--
-- TOC entry 3197 (class 2606 OID 16838)
-- Name: Status Status_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."Status"
    ADD CONSTRAINT "Status_pkey" PRIMARY KEY (status_id);


--
-- TOC entry 3193 (class 2606 OID 16820)
-- Name: Users Users_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."Users"
    ADD CONSTRAINT "Users_pkey" PRIMARY KEY (user_id);


--
-- TOC entry 3206 (class 2606 OID 16866)
-- Name: Recordlist error_id; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."Recordlist"
    ADD CONSTRAINT error_id FOREIGN KEY (error_id) REFERENCES public."Errorlist"(error_id) NOT VALID;


--
-- TOC entry 3202 (class 2606 OID 16871)
-- Name: Markups record_id; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."Markups"
    ADD CONSTRAINT record_id FOREIGN KEY (record_id) REFERENCES public."Recordlist"(record_id) NOT VALID;


--
-- TOC entry 3203 (class 2606 OID 16851)
-- Name: Markups severity_id; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."Markups"
    ADD CONSTRAINT severity_id FOREIGN KEY (severity_id) REFERENCES public."Severity"(severity_id) NOT VALID;


--
-- TOC entry 3204 (class 2606 OID 16846)
-- Name: Markups status_id; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."Markups"
    ADD CONSTRAINT status_id FOREIGN KEY (status_id) REFERENCES public."Status"(status_id) NOT VALID;


--
-- TOC entry 3205 (class 2606 OID 16826)
-- Name: Markups user_id; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."Markups"
    ADD CONSTRAINT user_id FOREIGN KEY (user_id) REFERENCES public."Users"(user_id);


-- Completed on 2024-04-23 01:26:17

--
-- PostgreSQL database dump complete
--

