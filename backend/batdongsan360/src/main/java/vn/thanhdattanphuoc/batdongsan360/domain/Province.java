package vn.thanhdattanphuoc.batdongsan360.domain;

import java.util.List;

import com.fasterxml.jackson.annotation.JsonIgnore;
import com.fasterxml.jackson.annotation.JsonProperty;

import jakarta.persistence.CascadeType;
import jakarta.persistence.Entity;
import jakarta.persistence.FetchType;
import jakarta.persistence.Id;
import jakarta.persistence.OneToMany;
import jakarta.persistence.Table;
import lombok.Getter;
import lombok.Setter;

@Getter
@Setter
@Entity
@Table(name = "provinces")
public class Province {

    @Id
    private long code;

    private String name;
    @JsonIgnore
    private String codename;
    @JsonProperty("division_type")
    private String divisionType;
    @JsonProperty("phone_code")
    @JsonIgnore
    private int phoneCode;

    @OneToMany(mappedBy = "province")
    @JsonIgnore
    private List<Post> post;

    @OneToMany(mappedBy = "province", cascade = CascadeType.ALL, orphanRemoval = true, fetch = FetchType.LAZY)
    @JsonIgnore
    private List<District> districts;

}